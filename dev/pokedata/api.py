"""PokeAPI client with file-based caching."""

import json
import os
import time

import requests

from .paths import GEN5_ANIMATED_DIR, GEN5_STATIC_DIR, POKEAPI_CACHE_DIR

BASE_URL = "https://pokeapi.co/api/v2"
DEFAULT_CACHE_DIR = POKEAPI_CACHE_DIR

# Rate limiting: delay between uncached API calls (seconds)
REQUEST_DELAY = 0.15
# Retry config for HTTP 429
MAX_RETRIES = 5
INITIAL_BACKOFF = 1.0


class PokeApiClient:
    """Synchronous PokeAPI client with file-based JSON caching.

    Each API response is cached as {cache_dir}/{category}/{id}.json.
    PokeAPI data is static, so there is no cache TTL.

    # --- Async migration guide ---
    # To convert to async for faster processing:
    # 1. pip install aiohttp
    # 2. Replace requests.get() with aiohttp.ClientSession().get()
    # 3. Use asyncio.Semaphore(10) to limit concurrent requests
    # 4. Gather all fetch tasks with asyncio.gather(*tasks)
    # Example:
    #   async with aiohttp.ClientSession() as session:
    #       sem = asyncio.Semaphore(10)
    #       async def fetch(url):
    #           async with sem:
    #               async with session.get(url) as resp:
    #                   return await resp.json()
    #       results = await asyncio.gather(*[fetch(url) for url in urls])
    """

    def __init__(self, cache_dir=None):
        self.cache_dir = cache_dir or DEFAULT_CACHE_DIR
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "pokedata-tool/1.0"})
        self._last_request_time = 0

    def _cache_path(self, category, resource_id):
        return os.path.join(self.cache_dir, category, f"{resource_id}.json")

    def _read_cache(self, category, resource_id):
        path = self._cache_path(category, resource_id)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return None

    def _write_cache(self, category, resource_id, data):
        path = self._cache_path(category, resource_id)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False)

    def _rate_limit(self):
        elapsed = time.time() - self._last_request_time
        if elapsed < REQUEST_DELAY:
            time.sleep(REQUEST_DELAY - elapsed)
        self._last_request_time = time.time()

    def _fetch(self, url):
        """Fetch URL with retry and exponential backoff."""
        for attempt in range(MAX_RETRIES):
            self._rate_limit()
            try:
                resp = self.session.get(url, timeout=30)
                if resp.status_code == 200:
                    return resp.json()
                if resp.status_code == 429:
                    wait = INITIAL_BACKOFF * (2 ** attempt)
                    print(f"  Rate limited, waiting {wait:.1f}s...")
                    time.sleep(wait)
                    continue
                if resp.status_code == 404:
                    return None
                resp.raise_for_status()
            except requests.RequestException as e:
                if attempt < MAX_RETRIES - 1:
                    wait = INITIAL_BACKOFF * (2 ** attempt)
                    print(f"  Request error: {e}, retrying in {wait:.1f}s...")
                    time.sleep(wait)
                else:
                    print(f"  Failed after {MAX_RETRIES} attempts: {e}")
                    return None
        return None

    def get_species(self, pokemon_id):
        """Fetch pokemon-species/{id}."""
        cached = self._read_cache("pokemon-species", pokemon_id)
        if cached is not None:
            return cached
        data = self._fetch(f"{BASE_URL}/pokemon-species/{pokemon_id}")
        if data:
            self._write_cache("pokemon-species", pokemon_id, data)
        return data

    def get_encounters(self, pokemon_id):
        """Fetch pokemon/{id}/encounters."""
        cached = self._read_cache("pokemon-encounters", pokemon_id)
        if cached is not None:
            return cached
        data = self._fetch(f"{BASE_URL}/pokemon/{pokemon_id}/encounters")
        if data is not None:
            self._write_cache("pokemon-encounters", pokemon_id, data)
        return data

    def get_pokemon(self, pokemon_id):
        """Fetch pokemon/{id} for type info."""
        cached = self._read_cache("pokemon", pokemon_id)
        if cached is not None:
            return cached
        data = self._fetch(f"{BASE_URL}/pokemon/{pokemon_id}")
        if data:
            self._write_cache("pokemon", pokemon_id, data)
        return data

    def get_evolution_chain(self, chain_id):
        """Fetch evolution-chain/{id}."""
        cached = self._read_cache("evolution-chain", chain_id)
        if cached is not None:
            return cached
        data = self._fetch(f"{BASE_URL}/evolution-chain/{chain_id}")
        if data:
            self._write_cache("evolution-chain", chain_id, data)
        return data

    def get_location_area(self, location_area):
        """Fetch location-area/{id-or-name} from a ref dict, URL, id, or name."""
        return self._get_named_resource("location-area", location_area)

    def get_location(self, location):
        """Fetch location/{id-or-name} from a ref dict, URL, id, or name."""
        return self._get_named_resource("location", location)

    def _get_named_resource(self, category, resource):
        resource_id = _resource_id_from_ref(resource)
        if not resource_id:
            return None

        cached = self._read_cache(category, resource_id)
        if cached is not None:
            return cached

        data = self._fetch(f"{BASE_URL}/{category}/{resource_id}")
        if data:
            self._write_cache(category, resource_id, data)
        return data

    def get_sprite(self, pokemon_id):
        """Resolve static Gen V sprite or download fallback PNG.

        Saves fallback files to {cache_dir}/sprites/{id}.png.
        Returns the local file path, or None on failure.
        """
        vendor_sprite_path = os.path.join(GEN5_STATIC_DIR, f"{pokemon_id}.png")
        if os.path.exists(vendor_sprite_path):
            return vendor_sprite_path

        sprite_path = os.path.join(self.cache_dir, "sprites", f"{pokemon_id}.png")
        if os.path.exists(sprite_path):
            return sprite_path

        pokemon_data = self.get_pokemon(pokemon_id)
        if not pokemon_data:
            return None

        url = pokemon_data.get("sprites", {}).get("front_default")
        if not url:
            return None

        return self._download_file(url, sprite_path, pokemon_id)

    def get_animated_sprite(self, pokemon_id):
        """Resolve local Gen V animated sprite or download fallback GIF.

        Saves fallback files to {cache_dir}/sprites/animated/{id}.gif.
        Returns the local file path, or None on failure.
        """
        vendor_gif_path = os.path.join(GEN5_ANIMATED_DIR, f"{pokemon_id}.gif")
        if os.path.exists(vendor_gif_path):
            return vendor_gif_path

        gif_path = os.path.join(self.cache_dir, "sprites", "animated", f"{pokemon_id}.gif")
        if os.path.exists(gif_path):
            return gif_path

        pokemon_data = self.get_pokemon(pokemon_id)
        if not pokemon_data:
            return None

        # Try animated from Gen V Black/White
        url = (
            pokemon_data.get("sprites", {})
            .get("versions", {})
            .get("generation-v", {})
            .get("black-white", {})
            .get("animated", {})
            .get("front_default")
        )
        if url:
            result = self._download_file(url, gif_path, pokemon_id)
            if result:
                return result

        # Fallback: showdown animated
        url = (
            pokemon_data.get("sprites", {})
            .get("other", {})
            .get("showdown", {})
            .get("front_default")
        )
        if url:
            return self._download_file(url, gif_path, pokemon_id)

        return None

    def _download_file(self, url, dest_path, pokemon_id):
        """Download a file from URL to dest_path."""
        self._rate_limit()
        try:
            resp = self.session.get(url, timeout=30)
            if resp.status_code == 200:
                os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                with open(dest_path, "wb") as f:
                    f.write(resp.content)
                return dest_path
        except requests.RequestException as e:
            print(f"  Download failed for #{pokemon_id}: {e}")
        return None


def _resource_id_from_ref(resource):
    if not resource:
        return None
    if isinstance(resource, int):
        return resource
    if isinstance(resource, str):
        return resource.rstrip("/").split("/")[-1]
    if isinstance(resource, dict):
        url = resource.get("url")
        if url:
            return url.rstrip("/").split("/")[-1]
        return resource.get("name")
    return None
