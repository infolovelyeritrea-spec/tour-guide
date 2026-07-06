import argparse
import sys
from pathlib import Path

from PIL import Image, ImageOps


PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_ROOT = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_ROOT))

from api.image_processing import TOUR_PACKAGE_IMAGE_QUALITY, TOUR_PACKAGE_IMAGE_SIZE


SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def parse_args():
    parser = argparse.ArgumentParser(
        description="Resize and compress images in a folder while preserving aspect ratio."
    )
    parser.add_argument("source", help="Folder containing images to process.")
    parser.add_argument(
        "-o",
        "--output",
        default=None,
        help="Output folder. Defaults to <source>_optimized unless --in-place is used.",
    )
    parser.add_argument(
        "--preset",
        choices=["tour-package"],
        default=None,
        help="Use a project preset. 'tour-package' outputs the same 1200x740 ratio as the package gallery images.",
    )
    parser.add_argument("--width", type=int, default=1600, help="Output width or maximum width in pixels.")
    parser.add_argument("--height", type=int, default=1200, help="Output height or maximum height in pixels.")
    parser.add_argument("--quality", type=int, default=None, help="Compression quality from 1 to 100.")
    parser.add_argument(
        "--fit",
        choices=["contain", "cover"],
        default="contain",
        help="'contain' keeps the full image inside the box. 'cover' crops to exactly width x height.",
    )
    parser.add_argument(
        "--format",
        choices=["original", "jpg", "png", "webp"],
        default="webp",
        help="Output image format. Use 'original' to keep each original extension.",
    )
    parser.add_argument("--recursive", action="store_true", help="Process subfolders too.")
    parser.add_argument("--in-place", action="store_true", help="Overwrite source images.")
    return parser.parse_args()


def apply_preset(args):
    if args.preset == "tour-package":
        args.width, args.height = TOUR_PACKAGE_IMAGE_SIZE
        if args.quality is None:
            args.quality = TOUR_PACKAGE_IMAGE_QUALITY
        args.fit = "cover"
        if args.format == "original":
            args.format = "webp"
    elif args.quality is None:
        args.quality = TOUR_PACKAGE_IMAGE_QUALITY
    return args


def get_output_path(source_file, source_root, output_root, output_format):
    relative_path = source_file.relative_to(source_root)
    if output_format == "original":
        return output_root / relative_path

    return (output_root / relative_path).with_suffix(f".{output_format}")


def save_image(image, output_path, output_format, quality):
    output_path.parent.mkdir(parents=True, exist_ok=True)

    save_format = output_format.upper()
    if save_format == "JPG":
        save_format = "JPEG"

    if save_format in {"JPEG", "WEBP"}:
        image = image.convert("RGB")

    save_options = {"quality": quality, "optimize": True}
    if save_format == "WEBP":
        save_options["method"] = 6

    image.save(output_path, format=save_format, **save_options)


def resize_to_cover(image, size):
    source_width, source_height = image.size
    target_width, target_height = size
    scale = max(target_width / source_width, target_height / source_height)
    resized_size = (round(source_width * scale), round(source_height * scale))
    resized = image.resize(resized_size, Image.Resampling.LANCZOS)

    left = (resized.width - target_width) // 2
    top = (resized.height - target_height) // 2
    return resized.crop((left, top, left + target_width, top + target_height))


def resize_image(source_file, source_root, output_root, target_size, quality, output_format, fit):
    with Image.open(source_file) as image:
        image = ImageOps.exif_transpose(image)
        if fit == "cover":
            image = resize_to_cover(image, target_size)
        else:
            image.thumbnail(target_size, Image.Resampling.LANCZOS)

        final_format = output_format
        if final_format == "original":
            final_format = source_file.suffix.lower().lstrip(".")
            if final_format == "jpeg":
                final_format = "jpg"

        output_path = get_output_path(source_file, source_root, output_root, output_format)
        original_size = source_file.stat().st_size
        save_image(image, output_path, final_format, quality)
        optimized_size = output_path.stat().st_size

    return output_path, original_size, optimized_size


def iter_images(source_root, recursive):
    pattern = "**/*" if recursive else "*"
    for path in source_root.glob(pattern):
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS:
            yield path


def format_bytes(size):
    for unit in ["B", "KB", "MB", "GB"]:
        if size < 1024:
            return f"{size:.1f} {unit}"
        size /= 1024
    return f"{size:.1f} TB"


def main():
    args = apply_preset(parse_args())
    source_root = Path(args.source).resolve()

    if not source_root.exists() or not source_root.is_dir():
        raise SystemExit(f"Source folder does not exist: {source_root}")

    if args.in_place:
        output_root = source_root
        output_format = "original" if args.format == "original" else args.format
    else:
        output_root = Path(args.output).resolve() if args.output else source_root.with_name(f"{source_root.name}_optimized")
        output_format = args.format

    target_size = (args.width, args.height)
    total_original = 0
    total_optimized = 0
    processed = 0

    for source_file in iter_images(source_root, args.recursive):
        output_path, original_size, optimized_size = resize_image(
            source_file=source_file,
            source_root=source_root,
            output_root=output_root,
            target_size=target_size,
            quality=args.quality,
            output_format=output_format,
            fit=args.fit,
        )
        processed += 1
        total_original += original_size
        total_optimized += optimized_size
        print(f"{source_file.name} -> {output_path} ({format_bytes(original_size)} to {format_bytes(optimized_size)})")

    if processed == 0:
        print("No supported images found.")
        return

    saved = total_original - total_optimized
    print(
        f"Processed {processed} image(s). "
        f"Total: {format_bytes(total_original)} to {format_bytes(total_optimized)} "
        f"({format_bytes(saved)} saved)."
    )


if __name__ == "__main__":
    main()
