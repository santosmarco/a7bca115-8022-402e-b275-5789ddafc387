import csv
import json
from api_video import ApiVideoAuth

# Initialize the ApiVideoAuth class
API_KEY = (
    "dHGElV8BsOEzcjGM1eLOy5LYnrx0TyqR45TgfjMBPL2"  # Replace with your actual API key
)
api_video = ApiVideoAuth(API_KEY)


def read_csv(file_path):
    activities = {}
    with open(file_path, "r") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            video_id = row["index"].split("_")[0]
            if video_id not in activities:
                activities[video_id] = []

            # Add the 'type' key based on the 'activity' field
            row["type"] = row["activity"].lower()

            activities[video_id].append(row)
    return activities


def update_video_metadata(video_id, activities):
    # Convert activities to JSON string
    activities_json = json.dumps(activities)

    # Prepare metadata update
    metadata = {"metadata": {"activities": activities_json}}

    try:
        # Update video metadata
        api_video.update_video(video_id, metadata)
        print(f"Updated metadata for video {video_id}")
    except Exception as e:
        print(f"Error updating metadata for video {video_id}: {str(e)}")


def main():
    csv_file_path = "tmp/activity_moments_clean_v2.csv"

    # Read and aggregate activities from CSV
    activities_by_video = read_csv(csv_file_path)

    # Update metadata for each video
    for video_id, activities in activities_by_video.items():
        # update_video_metadata(video_id, activities)
        print(f"Video ID: {video_id}")
        for activity in activities[:2]:  # Print first two activities for each video
            print(f"  Type: {activity['type']}")
            print(f"  Title: {activity['title']}")
            print(
                f"  Summary: {activity['summary'][:100]}..."
            )  # Print first 100 characters of summary
        print()  # Empty line for readability


if __name__ == "__main__":
    main()
