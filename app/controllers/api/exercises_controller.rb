module Api
  class ExercisesController < ApplicationController
    before_action :require_current_user!

    def index
      render json: { exercises: current_user.exercises.map { |exercise| serialize_exercise(exercise) } }
    end

    def show
      render json: { exercise: serialize_exercise(exercise) }
    end

    def create
      exercise = current_user.exercises.build(exercise_params)

      if exercise.save
        render json: { exercise: serialize_exercise(exercise) }, status: :created
      else
        render_validation_error(exercise, message: 'Exercise could not be created')
      end
    end

    def update
      if exercise.update(exercise_params)
        render json: { exercise: serialize_exercise(exercise) }
      else
        render_validation_error(exercise, message: 'Exercise could not be updated')
      end
    end

    def destroy
      exercise.destroy!
      head :no_content
    end

    private

    def exercise
      @exercise ||= current_user.exercises.find(params[:id])
    end

    def exercise_params
      params.fetch(:exercise, ActionController::Parameters.new).permit(
        :name,
        :description,
        :muscle_group,
        :sets,
        :repetitions
      )
    end

    def serialize_exercise(exercise)
      {
        id: exercise.id.to_s,
        name: exercise.name,
        description: exercise.description,
        muscle_group: exercise.muscle_group,
        sets: exercise.sets,
        repetitions: exercise.repetitions
      }
    end
  end
end
