module Api
  class WorkoutsController < ApplicationController
    before_action :require_current_user!

    def index
      render json: { workouts: current_user.workouts.map { |workout| serialize_workout(workout) } }
    end

    def show
      render json: { workout: serialize_workout(workout) }
    end

    def create
      workout = current_user.workouts.build(workout_params)

      if workout.save
        render json: { workout: serialize_workout(workout) }, status: :created
      else
        render_validation_error(workout, message: 'Workout could not be created')
      end
    end

    def update
      if workout.update(workout_params)
        render json: { workout: serialize_workout(workout) }
      else
        render_validation_error(workout, message: 'Workout could not be updated')
      end
    end

    def destroy
      workout.destroy!
      head :no_content
    end

    def today
      workout = current_user.workouts.where(weekday: current_weekday).first

      if workout
        render json: { workout: serialize_workout(workout) }
      else
        render json: { workout: nil, message: 'Nenhum treino cadastrado para hoje' }
      end
    end

    private

    def workout
      @workout ||= current_user.workouts.find(params[:id])
    end

    def workout_params
      permitted = params.fetch(:workout, ActionController::Parameters.new).permit(
        :name,
        :weekday,
        exercises: %i[name description muscle_group sets repetitions]
      )

      permitted[:exercises] = Array(permitted[:exercises]).map(&:to_h) if permitted.key?(:exercises)
      permitted
    end

    def current_weekday
      Date.current.strftime('%A').downcase
    end

    def serialize_workout(workout)
      {
        id: workout.id.to_s,
        name: workout.name,
        weekday: workout.weekday,
        exercises: workout.exercises
      }
    end
  end
end
