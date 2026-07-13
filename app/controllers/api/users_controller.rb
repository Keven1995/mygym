module Api
  class UsersController < ApplicationController
    def sync
      user = User.find_or_initialize_by(firebase_uid: firebase_uid)
      created = user.new_record?

      user.assign_attributes(sync_user_attributes)

      if user.save
        render json: { user: serialize_user(user) }, status: created ? :created : :ok
      else
        render json: {
          error: 'validation_error',
          message: 'User could not be synced',
          details: user.errors.messages
        }, status: :unprocessable_entity
      end
    end

    private

    def sync_user_attributes
      request_attributes = sync_user_params

      {
        name: firebase_token_payload['name'].presence || request_attributes[:name],
        email: firebase_token_payload['email'].presence || request_attributes[:email],
        photo_url: firebase_token_payload['picture'].presence || request_attributes[:photo_url] || request_attributes[:photoURL]
      }
    end

    def sync_user_params
      params.fetch(:user, ActionController::Parameters.new).permit(:name, :email, :photo_url, :photoURL)
    end

    def serialize_user(user)
      {
        id: user.id.to_s,
        name: user.name,
        email: user.email,
        photo_url: user.photo_url,
        firebase_uid: user.firebase_uid
      }
    end
  end
end
