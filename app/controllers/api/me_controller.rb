module Api
  class MeController < ApplicationController
    before_action :require_current_user!

    def show
      render json: { user: serialize_user(current_user) }
    end

    def update
      if current_user.update(profile_params)
        render json: { user: serialize_user(current_user) }
      else
        render_validation_error(current_user, message: 'Profile could not be updated')
      end
    end

    private

    def profile_params
      params.fetch(:user, ActionController::Parameters.new).permit(:name, :email, :photo_url)
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
