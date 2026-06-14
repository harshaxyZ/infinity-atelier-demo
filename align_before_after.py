import cv2
import numpy as np
import os

before_path = r"C:\Users\harsh\OneDrive\Pictures\antigravity\infinity demo\images\before image.png"
after_path = r"C:\Users\harsh\OneDrive\Pictures\antigravity\infinity demo\images\don't_do_anything,_turn_these_202606132155 (4).jpeg"

dest_onedrive_before = r"C:\Users\harsh\OneDrive\Pictures\antigravity\infinity-atelier\assets\projects\before_construction.webp"
dest_onedrive_after = r"C:\Users\harsh\OneDrive\Pictures\antigravity\infinity-atelier\assets\projects\modern-living\project_14_1200.webp"
dest_scratch_before = r"C:\Users\harsh\.gemini\antigravity-ide\scratch\infinity-atelier\assets\projects\before_construction.webp"
dest_scratch_after = r"C:\Users\harsh\.gemini\antigravity-ide\scratch\infinity-atelier\assets\projects\modern-living\project_14_1200.webp"

def align_images():
    print("Loading images...")
    img_before = cv2.imread(before_path)
    img_after = cv2.imread(after_path)
    
    if img_before is None or img_after is None:
        print("Error: Could not load images.")
        return

    # Convert to grayscale
    gray_before = cv2.cvtColor(img_before, cv2.COLOR_BGR2GRAY)
    gray_after = cv2.cvtColor(img_after, cv2.COLOR_BGR2GRAY)

    # Initialize SIFT detector
    print("Detecting features...")
    sift = cv2.SIFT_create()
    kp_before, des_before = sift.detectAndCompute(gray_before, None)
    kp_after, des_after = sift.detectAndCompute(gray_after, None)

    # BFMatcher with default params
    print("Matching features...")
    bf = cv2.BFMatcher()
    matches = bf.knnMatch(des_before, des_after, k=2)

    # Apply ratio test
    good_matches = []
    for m, n in matches:
        if m.distance < 0.75 * n.distance:
            good_matches.append(m)

    print(f"Found {len(good_matches)} good matches.")

    if len(good_matches) < 4:
        print("Error: Not enough matches to align images.")
        return

    # Extract locations of good matches
    points_before = np.zeros((len(good_matches), 2), dtype=np.float32)
    points_after = np.zeros((len(good_matches), 2), dtype=np.float32)

    for i, match in enumerate(good_matches):
        points_before[i, :] = kp_before[match.queryIdx].pt
        points_after[i, :] = kp_after[match.trainIdx].pt

    # Find homography
    H, mask = cv2.findHomography(points_before, points_after, cv2.RANSAC, 5.0)

    # Use homography to warp the before image to match the after image
    h, w, c = img_after.shape
    warped_before = cv2.warpPerspective(img_before, H, (w, h))

    # Save images in high-quality webp
    print("Saving aligned images...")
    for path in [dest_onedrive_before, dest_scratch_before]:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        cv2.imwrite(path, warped_before, [int(cv2.IMWRITE_WEBP_QUALITY), 85])
        
    for path in [dest_onedrive_after, dest_scratch_after]:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        cv2.imwrite(path, img_after, [int(cv2.IMWRITE_WEBP_QUALITY), 85])

    print("Alignment complete!")

if __name__ == "__main__":
    align_images()
