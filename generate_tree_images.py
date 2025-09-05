import base64
import os
import mimetypes
import csv
from google import genai
from google.genai import types
from ratelimit import limits, sleep_and_retry

def save_binary_file(file_name, data):
    # Check if data is base64 encoded
    try:
        # Try to decode base64 data
        decoded_data = base64.b64decode(data)
        f = open(file_name, "wb")
        f.write(decoded_data)
        f.close()
    except Exception as e:
        # If decoding fails, save the original data
        f = open(file_name, "wb")
        f.write(data)
        f.close()
        print(f"Warning: Could not decode base64 data for {file_name}: {str(e)}")

@sleep_and_retry
@limits(calls=10, period=60)
def generate_tree_image(client, tree_name):
    model = "gemini-2.0-flash-exp-image-generation"
    
    # Clean the tree name to create a valid filename
    clean_name = tree_name.split('(')[0].strip().lower().replace(' ', '_')
    
    # Check if image already exists
    image_dir = "images"
    os.makedirs(image_dir, exist_ok=True)
    
    # Check for common image extensions
    for ext in ['.png', '.jpg', '.jpeg']:
        potential_file = f"{image_dir}/{clean_name}{ext}"
        if os.path.exists(potential_file):
            print(f"Image for {tree_name} already exists at: {potential_file}")
            return
    
    prompt = f"""Create a square image of a {tree_name} in a traditional botanical illustration style, with muted colors, close-up against a white background. Leave whitespace padding around the borders of the image. Show the leaves and fruit, but do not show seeds or other inset parts. Do not include any numbers or text."""
    
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=prompt),
            ],
        ),
    ]
    generate_content_config = types.GenerateContentConfig(
        response_modalities=[
            "image",
            "text",
        ],
        response_mime_type="text/plain",
    )

    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        if not chunk.candidates or not chunk.candidates[0].content or not chunk.candidates[0].content.parts:
            continue
        if chunk.candidates[0].content.parts[0].inline_data:
            # Create images directory if it doesn't exist
            os.makedirs("images", exist_ok=True)
            
            file_name = f"{image_dir}/{clean_name}"
            
            inline_data = chunk.candidates[0].content.parts[0].inline_data
            file_extension = mimetypes.guess_extension(inline_data.mime_type)
            save_binary_file(
                f"{file_name}{file_extension}", inline_data.data
            )
            print(
                f"Generated image for {tree_name} saved to: {file_name}{file_extension}"
            )
        else:
            print(chunk.text)

def main():
    client = genai.Client(
        api_key="API_KEY_GOES_HERE"
    )
    
    with open('fruits.csv', 'r') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            tree_name = row['Name'].split('(')[0].strip()
            print(f"Generating image for {tree_name}...")
            generate_tree_image(client, tree_name)

if __name__ == "__main__":
    main()