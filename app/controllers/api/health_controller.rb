module Api
  class HealthController < ApplicationController
    skip_before_action :authenticate_request!

    def show
      render json: { status: 'ok' }
    end
  end
end
