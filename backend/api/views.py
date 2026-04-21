from datetime import date

from django.contrib.auth import authenticate, login, logout
from django.db import DatabaseError
from django.db.models import Count
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Booking, Destination, Memory, Review, VisitorLog
from .serializers import BookingSerializer, DestinationSerializer, MemorySerializer, ReviewSerializer


TRACKABLE_PATHS = {"/", "/admin"}

DESTINATION_SEED = [
    {
        "name": "Asmara",
        "region": "Central Eritrea",
        "description": "A modernist capital with palm-lined boulevards, Italian-era architecture, and an easy cafe rhythm.",
        "image_url": "/images/destinations/asmara.jpg",
        "highlights": "Fiat Tagliero, Cinema Impero, boulevard cafes, art deco walks",
        "travel_time": "2-3 days",
    },
    {
        "name": "Massawa",
        "region": "Red Sea Coast",
        "description": "A sunlit port city of coral-stone buildings, island breezes, and unforgettable Red Sea views.",
        "image_url": "/images/destinations/massawa.jpg",
        "highlights": "Island promenade, Ottoman quarter, snorkeling, sea sunsets",
        "travel_time": "2 days",
    },
    {
        "name": "Keren",
        "region": "Anseba",
        "description": "A vibrant market town framed by rugged hills, camel caravans, and living Eritrean traditions.",
        "image_url": "/images/destinations/keren.jpg",
        "highlights": "Camel market, Mariam Dearit, mountain scenery, local crafts",
        "travel_time": "1-2 days",
    },
]

MEMORY_SEED = [
    {
        "title": "Morning Walk in Asmara",
        "location": "Asmara",
        "description": "Golden light across art deco facades, coffee aromas, and calm streets make the city unforgettable.",
        "image_url": "/images/memories/one.jpg",
    },
    {
        "title": "Red Sea Escape",
        "location": "Massawa",
        "description": "Historic piers, turquoise water, and warm sea air turn every afternoon into a postcard memory.",
        "image_url": "/images/memories/two.jpg",
    },
    {
        "title": "Mountain Market Day",
        "location": "Keren",
        "description": "Colorful textiles, lively stalls, and community spirit create a deeply local travel experience.",
        "image_url": "/images/memories/three.jpg",
    },
]

REVIEW_SEED = [
    {
        "name": "Liya",
        "origin_country": "Ethiopia",
        "title": "Warm hosting and easy planning",
        "rating": 5,
        "trip_type": "city",
        "comment": "The planning felt calm from the first message, and our Asmara days were well paced and welcoming.",
    },
    {
        "name": "Samir",
        "origin_country": "Sudan",
        "title": "Beautiful coast itinerary",
        "rating": 5,
        "trip_type": "coast",
        "comment": "Massawa was the highlight for us. We appreciated the clear timing, local tips, and thoughtful recommendations.",
    },
    {
        "name": "Marta",
        "origin_country": "Italy",
        "title": "Great for family travel",
        "rating": 4,
        "trip_type": "family",
        "comment": "Our family booking was straightforward, and the team helped us balance city stops with a slower pace for the children.",
    },
]


def ensure_seed_data():
    if not Destination.objects.exists():
        for item in DESTINATION_SEED:
            Destination.objects.create(**item)

    if not Memory.objects.exists():
        for item in MEMORY_SEED:
            Memory.objects.create(**item)

    if not Review.objects.exists():
        for item in REVIEW_SEED:
            Review.objects.create(**item)


def get_visitor_count():
    try:
        return VisitorLog.objects.values("ip_address").distinct().count()
    except DatabaseError:
        return 0


def get_popular_interest():
    try:
        return list(VisitorLog.objects.values("path").annotate(total=Count("id")).order_by("-total")[:5])
    except DatabaseError:
        return []


class HomeDataView(APIView):
    def get(self, request):
        ensure_seed_data()
        destinations = DestinationSerializer(Destination.objects.all()[:3], many=True).data
        memories = MemorySerializer(Memory.objects.all()[:3], many=True).data
        return Response(
            {
                "hero": {
                    "title": "Discover Eritrea",
                    "subtitle": "Plan memorable cultural, coastal, and city adventures with a simple and welcoming guide.",
                    "image_url": "/images/hero/hero.jpg",
                },
                "destinations": destinations,
                "memories": memories,
                "stats": {
                    "destinations": Destination.objects.count(),
                    "bookings": Booking.objects.count(),
                    "visitors": get_visitor_count(),
                },
            }
        )


class DestinationListView(APIView):
    def get(self, request):
        ensure_seed_data()
        serializer = DestinationSerializer(Destination.objects.all(), many=True)
        return Response(serializer.data)


class MemoryListView(APIView):
    def get(self, request):
        ensure_seed_data()
        serializer = MemorySerializer(Memory.objects.all(), many=True)
        return Response(serializer.data)


class ReviewListView(APIView):
    def get(self, request):
        ensure_seed_data()
        serializer = ReviewSerializer(Review.objects.filter(approved=True), many=True)
        return Response(serializer.data)


@method_decorator(csrf_exempt, name="dispatch")
class ReviewCreateView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = serializer.save(approved=True)
        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name="dispatch")
class BookingCreateView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = BookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name="dispatch")
class TrackVisitorView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        ip_address = request.META.get("REMOTE_ADDR")
        user_agent = request.META.get("HTTP_USER_AGENT", "")
        raw_path = str(request.data.get("path", "/") or "/")
        normalized_path = "/" + "/".join(segment for segment in raw_path.split("/") if segment)
        path = normalized_path if normalized_path != "" else "/"

        if path not in TRACKABLE_PATHS:
            return Response({"message": "Path ignored."}, status=status.HTTP_202_ACCEPTED)

        try:
            VisitorLog.objects.create(path=path, ip_address=ip_address, user_agent=user_agent)
        except DatabaseError:
            return Response({"message": "Visitor tracking unavailable."}, status=status.HTTP_202_ACCEPTED)
        return Response({"message": "Visitor tracked."}, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name="dispatch")
class AdminLoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        username = request.data.get("username", "").strip()
        password = request.data.get("password", "")

        user = authenticate(request, username=username, password=password)
        if not user or not user.is_active or not user.is_staff:
            return Response({"detail": "Invalid admin credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        login(request, user)
        return Response({"message": "Login successful.", "username": user.username})


@method_decorator(csrf_exempt, name="dispatch")
class AdminLogoutView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        logout(request)
        return Response({"message": "Logout successful."})


class DashboardView(APIView):
    def get(self, request):
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        ensure_seed_data()
        bookings = Booking.objects.all()
        reviews = Review.objects.filter(approved=True)
        recent_bookings = BookingSerializer(bookings, many=True).data
        recent_reviews = ReviewSerializer(reviews, many=True).data
        return Response(
            {
                "generated_on": str(date.today()),
                "username": request.user.username,
                "visitors": get_visitor_count(),
                "bookings": bookings.count(),
                "booking_details": recent_bookings,
                "popular_pages": get_popular_interest(),
                "reviews": recent_reviews,
            }
        )
