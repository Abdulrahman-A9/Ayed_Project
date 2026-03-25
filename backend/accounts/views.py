from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserRole
from .permissions import IsAdminRole
from .serializers import LoginSerializer, UserSerializer


REFRESH_COOKIE_NAME = "portfolio_refresh"
User = get_user_model()


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
	response.set_cookie(
		REFRESH_COOKIE_NAME,
		refresh_token,
		httponly=True,
		secure=not settings.DEBUG,
		samesite="Lax",
		max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
	)


class LoginView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		serializer = LoginSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user = authenticate(
			request,
			username=serializer.validated_data["username"],
			password=serializer.validated_data["password"],
		)
		if not user or user.role != UserRole.ADMIN:
			return Response(
				{"detail": "Invalid credentials."},
				status=status.HTTP_401_UNAUTHORIZED,
			)

		refresh = RefreshToken.for_user(user)
		response = Response(
			{
				"access": str(refresh.access_token),
				"user": UserSerializer(user).data,
			}
		)
		_set_refresh_cookie(response, str(refresh))
		return response


class RefreshView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		token = request.COOKIES.get(REFRESH_COOKIE_NAME)
		if not token:
			return Response({"detail": "Refresh token missing."}, status=status.HTTP_401_UNAUTHORIZED)

		try:
			refresh = RefreshToken(token)
			user = User.objects.get(pk=refresh["user_id"])
			refresh.blacklist()
			next_refresh = RefreshToken.for_user(user)
		except (TokenError, User.DoesNotExist):
			return Response({"detail": "Refresh token expired."}, status=status.HTTP_401_UNAUTHORIZED)

		response = Response({"access": str(next_refresh.access_token), "user": UserSerializer(user).data})
		_set_refresh_cookie(response, str(next_refresh))
		return response


class LogoutView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		token = request.COOKIES.get(REFRESH_COOKIE_NAME)
		if token:
			try:
				RefreshToken(token).blacklist()
			except TokenError:
				pass

		response = Response(status=status.HTTP_204_NO_CONTENT)
		response.delete_cookie(REFRESH_COOKIE_NAME)
		return response


class MeView(APIView):
	permission_classes = [permissions.IsAuthenticated, IsAdminRole]

	def get(self, request):
		return Response(UserSerializer(request.user).data)

# Create your views here.
