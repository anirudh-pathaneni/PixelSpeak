from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from bson.objectid import ObjectId
from pymongo import MongoClient
from django.contrib.auth.hashers import make_password, check_password
from .serializers import UserSerializer, LoginSerializer
from django.db import IntegrityError

# MongoDB connection setup
client = MongoClient("mongodb://localhost:23017/PixelSpeak")
db = client['PixelSpeak']
users_collection = db['users']

@api_view(['POST'])
def signup_view(request):
    """
    Handles user signup.
    """
    try:
        data = request.data
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not username or not email or not password:
            return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if email already exists in MongoDB
        if users_collection.find_one({"email": email}):
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # Hash the password before saving
        hashed_password = make_password(password)
        
        # Create the user document
        user = {
            "username": username,
            "email": email,
            "password": hashed_password
        }
        
        # Insert user document into MongoDB
        result = users_collection.insert_one(user)

        # Respond with success message
        return Response({
            "message": "User registered successfully.",
            "user": {
                "id": str(result.inserted_id),  # Convert ObjectId to string
                "username": username,
                "email": email
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def login_view(request):
    """
    Handles user login.
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        # Fetch user from MongoDB by email
        user = users_collection.find_one({"email": email})
        
        if user and check_password(password, user["password"]):
            # If user exists and password matches
            user_data = {
                "id": str(user["_id"]),  # Convert ObjectId to string
                "username": user["username"],
                "email": user["email"]
            }
            # print(user_data)
            return Response(user_data, status=status.HTTP_200_OK)
        
        return Response({"error": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def logout_view(request):
    """
    Handles user logout. Stateless API returns a success message.
    """
    return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_user_view(request, user_id):
    """
    Retrieves user details by user ID.
    """
    try:
        # Fetch user from MongoDB by ID
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        # Prepare user data for response
        user_data = {
            "id": str(user["_id"]),  # Convert ObjectId to string
            "username": user["username"],
            "email": user["email"]
        }
        return Response(user_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": "Invalid user ID."}, status=status.HTTP_400_BAD_REQUEST)