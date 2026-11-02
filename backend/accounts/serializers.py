from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['institution', 'field_of_study', 'bio', 'created_at', 'updated_at']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'profile']
        read_only_fields = ['id', 'is_staff']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, min_length=6, style={'input_type': 'password'})
    institution = serializers.CharField(required=False, allow_blank=True, default='')
    field_of_study = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password_confirm', 'institution', 'field_of_study']

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return value

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({'password_confirm': "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        institution = validated_data.pop('institution', '')
        field_of_study = validated_data.pop('field_of_study', '')
        validated_data.pop('password_confirm')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password']
        )

        profile = user.profile
        profile.institution = institution
        profile.field_of_study = field_of_study
        profile.save()

        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if not username or not password:
            raise serializers.ValidationError("Must include both username and password.")

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials. Please verify username and password.")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")

        attrs['user'] = user
        return attrs

class UpdateProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    institution = serializers.CharField(required=False, allow_blank=True)
    field_of_study = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'institution', 'field_of_study', 'bio']

    def update(self, instance, validated_data):
        profile_data = {
            'institution': validated_data.pop('institution', None),
            'field_of_study': validated_data.pop('field_of_study', None),
            'bio': validated_data.pop('bio', None),
        }

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        profile = instance.profile
        for attr, value in profile_data.items():
            if value is not None:
                setattr(profile, attr, value)
        profile.save()

        return instance

