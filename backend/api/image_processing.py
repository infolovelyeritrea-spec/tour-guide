from io import BytesIO
from pathlib import Path

from django.core.files.base import ContentFile
from PIL import Image, ImageOps

try:
    from pillow_heif import register_heif_opener
except ImportError:
    register_heif_opener = None

if register_heif_opener:
    register_heif_opener()


TOUR_PACKAGE_IMAGE_SIZE = (1200, 740)
TOUR_PACKAGE_IMAGE_QUALITY = 82
TOUR_PACKAGE_IMAGE_FORMAT = "webp"


def resize_to_cover(image, size):
    source_width, source_height = image.size
    target_width, target_height = size
    scale = max(target_width / source_width, target_height / source_height)
    resized_size = (round(source_width * scale), round(source_height * scale))
    resized = image.resize(resized_size, Image.Resampling.LANCZOS)

    left = (resized.width - target_width) // 2
    top = (resized.height - target_height) // 2
    return resized.crop((left, top, left + target_width, top + target_height))


def save_optimized_image(image, output_format, quality):
    save_format = output_format.upper()
    if save_format == "JPG":
        save_format = "JPEG"

    if save_format in {"JPEG", "WEBP"}:
        image = image.convert("RGB")

    output = BytesIO()
    save_options = {"quality": quality, "optimize": True}
    if save_format == "WEBP":
        save_options["method"] = 6

    image.save(output, format=save_format, **save_options)
    return output.getvalue()


def optimize_image_file(image_file, size, quality, output_format, fit="cover"):
    image_file.seek(0)
    with Image.open(image_file) as image:
        image = ImageOps.exif_transpose(image)
        if fit == "cover":
            image = resize_to_cover(image, size)
        else:
            image.thumbnail(size, Image.Resampling.LANCZOS)

        return save_optimized_image(image, output_format, quality)


def get_optimized_filename(filename, output_format):
    path = Path(filename)
    return f"{path.stem}.{output_format}"


def optimize_uploaded_tour_package_image(uploaded_file):
    optimized_bytes = optimize_image_file(
        uploaded_file,
        size=TOUR_PACKAGE_IMAGE_SIZE,
        quality=TOUR_PACKAGE_IMAGE_QUALITY,
        output_format=TOUR_PACKAGE_IMAGE_FORMAT,
        fit="cover",
    )
    optimized_name = get_optimized_filename(uploaded_file.name, TOUR_PACKAGE_IMAGE_FORMAT)
    return ContentFile(optimized_bytes, name=optimized_name)
