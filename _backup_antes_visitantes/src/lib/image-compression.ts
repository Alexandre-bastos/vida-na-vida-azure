/**
 * Compresses an image file on the client side using Canvas.
 * Returns a new File object (JPEG).
 */
export async function compressImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    // Only compress images
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event: any) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not get canvas context'));

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            // Create a new file from the blob, changing extension to .jpg
            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            resolve(new File([blob], newFileName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            }));
          } else {
            reject(new Error('Canvas toBlob failed'));
          }
        }, 'image/jpeg', quality);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
