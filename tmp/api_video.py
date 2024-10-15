import os
import requests
import time
import json
import csv


class ApiVideoAuth:
    def __init__(self, api_key):
        self.api_key = api_key
        self.access_token = None
        self.refresh_token = None
        self.token_expiration = None
        self.base_url = "https://ws.api.video"
        self.csv_file = "/home/jupyteruser/video_tags.csv"
        self.existing_tags = self._load_existing_tags()

    def authenticate(self):
        url = f"{self.base_url}/auth/api-key"
        headers = {"Content-Type": "application/json"}
        data = {"apiKey": self.api_key}

        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 200:
            token_data = response.json()
            self.access_token = token_data["access_token"]
            self.refresh_token = token_data["refresh_token"]
            self.token_expiration = time.time() + token_data["expires_in"]
        else:
            raise Exception(
                f"Failed to authenticate: {response.status_code} - {response.text}"
            )

    def refresh_access_token(self):
        url = f"{self.base_url}/auth/refresh"
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        data = {"refreshToken": self.refresh_token}

        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 200:
            token_data = response.json()
            self.access_token = token_data["access_token"]
            self.refresh_token = token_data["refresh_token"]
            self.token_expiration = time.time() + token_data["expires_in"]
        else:
            raise Exception(
                f"Failed to refresh token: {response.status_code} - {response.text}"
            )

    def get_access_token(self):
        if not self.access_token or time.time() >= self.token_expiration:
            print("Token expired or not available, refreshing...")
            self.refresh_access_token()
        return self.access_token

    def _load_existing_tags(self):
        existing_tags = {}
        if os.path.isfile(self.csv_file):
            with open(self.csv_file, "r", newline="") as csvfile:
                reader = csv.reader(csvfile)
                next(reader)  # Skip header
                for row in reader:
                    video_id, tag = row
                    if video_id not in existing_tags:
                        existing_tags[video_id] = set()
                    existing_tags[video_id].add(tag)
        return existing_tags

    def _save_tags_to_csv(self, video_id, tags):
        new_tags = False
        if video_id not in self.existing_tags:
            self.existing_tags[video_id] = set()

        for tag in tags:
            if tag not in self.existing_tags[video_id]:
                self.existing_tags[video_id].add(tag)
                new_tags = True
                with open(self.csv_file, "a", newline="") as csvfile:
                    writer = csv.writer(csvfile)
                    writer.writerow([video_id, tag])

        if new_tags:
            print(f"New tags added for video {video_id}")
        else:
            print(f"No new tags for video {video_id}")

    def _make_request(self, method, endpoint, data=None, params=None, files=None):
        url = f"{self.base_url}{endpoint}"
        headers = {"Authorization": f"Bearer {self.get_access_token()}"}

        if data and not files:
            headers["Content-Type"] = "application/json"
            response = requests.request(
                method, url, json=data, params=params, headers=headers
            )
        else:
            response = requests.request(
                method, url, data=data, params=params, files=files, headers=headers
            )

        if response.status_code in [200, 201, 204]:
            return response.json() if response.content else None
        else:
            raise Exception(
                f"API request failed: {response.status_code} - {response.text}"
            )

    # Video endpoints
    def list_videos(self, params=None):
        videos = self._make_request("GET", "/videos", params=params)
        if "data" in videos:
            for video in videos["data"]:
                if "videoId" in video and "tags" in video:
                    self._save_tags_to_csv(video["videoId"], video["tags"])
        return videos

    def create_video(self, data):
        return self._make_request("POST", "/videos", data=data)

    def get_video(self, video_id):
        return self._make_request("GET", f"/videos/{video_id}")

    def update_video(self, video_id, data):
        return self._make_request("PATCH", f"/videos/{video_id}", data=data)

    def delete_video(self, video_id):
        return self._make_request("DELETE", f"/videos/{video_id}")

    def upload_video(self, video_id, file_path):
        with open(file_path, "rb") as file:
            return self._make_request(
                "POST", f"/videos/{video_id}/source", files={"file": file}
            )

    # Live stream endpoints
    def create_live_stream(self, data):
        return self._make_request("POST", "/live-streams", data=data)

    def get_live_stream(self, live_stream_id):
        return self._make_request("GET", f"/live-streams/{live_stream_id}")

    def update_live_stream(self, live_stream_id, data):
        return self._make_request("PATCH", f"/live-streams/{live_stream_id}", data=data)

    def delete_live_stream(self, live_stream_id):
        return self._make_request("DELETE", f"/live-streams/{live_stream_id}")

    # Player endpoints
    def create_player(self, data):
        return self._make_request("POST", "/players", data=data)

    def get_player(self, player_id):
        return self._make_request("GET", f"/players/{player_id}")

    def update_player(self, player_id, data):
        return self._make_request("PATCH", f"/players/{player_id}", data=data)

    def delete_player(self, player_id):
        return self._make_request("DELETE", f"/players/{player_id}")

    # Captions endpoints
    def upload_caption(self, video_id, language, file_path):
        with open(file_path, "rb") as file:
            return self._make_request(
                "POST", f"/videos/{video_id}/captions/{language}", files={"file": file}
            )

    def get_caption(self, video_id, language):
        return self._make_request("GET", f"/videos/{video_id}/captions/{language}")

    def update_caption(self, video_id, language, data):
        return self._make_request(
            "PATCH", f"/videos/{video_id}/captions/{language}", data=data
        )

    def delete_caption(self, video_id, language):
        return self._make_request("DELETE", f"/videos/{video_id}/captions/{language}")

    # Chapters endpoints
    def upload_chapter(self, video_id, language, file_path):
        with open(file_path, "rb") as file:
            return self._make_request(
                "POST", f"/videos/{video_id}/chapters/{language}", files={"file": file}
            )

    def get_chapter(self, video_id, language):
        return self._make_request("GET", f"/videos/{video_id}/chapters/{language}")

    def delete_chapter(self, video_id, language):
        return self._make_request("DELETE", f"/videos/{video_id}/chapters/{language}")

    # Watermark endpoints
    def upload_watermark(self, file_path):
        with open(file_path, "rb") as file:
            return self._make_request("POST", "/watermarks", files={"file": file})

    def delete_watermark(self, watermark_id):
        return self._make_request("DELETE", f"/watermarks/{watermark_id}")

    # Analytics endpoints
    def get_video_analytics(self, video_id, params=None):
        return self._make_request("GET", f"/analytics/videos/{video_id}", params=params)

    def get_live_stream_analytics(self, live_stream_id, params=None):
        return self._make_request(
            "GET", f"/analytics/live-streams/{live_stream_id}", params=params
        )

    # Helper functions
    def get_all_videos_for_person(self, person_names):
        tags = person_names if isinstance(person_names, list) else [person_names]
        return self.list_videos(params={"tags": tags})
