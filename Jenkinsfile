pipeline {
  agent any
  options {
    timeout(time: 1, unit: 'HOURS')
  }
  environment {
    IMAGE_BASE = "build.datapunt.amsterdam.nl:5000/amaps/embedkaart"
    IMAGE_BUILD = "${IMAGE_BASE}:${BUILD_NUMBER}"
    IMAGE_ACCEPTANCE = "${IMAGE_BASE}:acceptance"
    IMAGE_PRODUCTION = "${IMAGE_BASE}:production"
    IMAGE_LATEST = "${IMAGE_BASE}:latest"
  }
  stages {
    stage('Clean') {
      steps {
        sh "docker-compose -p ${BUILD_NUMBER} down -v || true"
      }
    }
    stage('Test') {
      // failFast true // fail if one of the parallel stages fail
      parallel {
        stage('Linting') {
          steps {
            // sh "docker-compose -p ${BUILD_NUMBER} up --build --exit-code-from lint lint"
            echo 'Linting disabled'
          }
        }
        stage('Testing') {
          steps {
            // sh "docker-compose -p ${BUILD_NUMBER} up --build --exit-code-from test test"
            echo 'Testing disabled'
          }
        }
      }
      post {
        always {
          sh "docker-compose -p ${BUILD_NUMBER} down -v || true"
        }
      }
    }
    stage('Build A (Master)') {
      when { branch 'build-serve' }
      steps {
        sh "docker build -t ${IMAGE_BUILD} " +
          "--file Dockerfile-prod " +
          "--shm-size 1G " +
          "--build-arg BUILD_ENV=acc " +
          "."
        sh "docker push ${IMAGE_BUILD}"
      }
    }
    stage('Deploy A (Master)') {
      when { branch 'build-serve' }
      steps {
        sh "docker pull ${IMAGE_BUILD}"
        sh "docker tag ${IMAGE_BUILD} ${IMAGE_ACCEPTANCE}"
        sh "docker push ${IMAGE_ACCEPTANCE}"
        build job: 'Subtask_Openstack_Playbook', parameters: [
          [$class: 'StringParameterValue', name: 'INVENTORY', value: 'acceptance'],
          [$class: 'StringParameterValue', name: 'PLAYBOOK', value: 'deploy-embedkaart.yml']
        ]
      }
    }
    stage('Build P (Master)') {
      when { branch 'master' }
      steps {
        // NOTE BUILD_ENV intentionaly not set (using Dockerfile default)
        sh "docker build -t ${IMAGE_PRODUCTION} " +
            "--shm-size 1G " +
            "."
        sh "docker tag ${IMAGE_PRODUCTION} ${IMAGE_LATEST}"
        sh "docker push ${IMAGE_PRODUCTION}"
        sh "docker push ${IMAGE_LATEST}"
      }
    }
    stage('Waiting for approval (Master)') {
      when {
        branch 'master'
      }
      options {
        timeout(time:5, unit:'DAYS')
      }
      steps {
        script {
          input "Deploy to Production?"
          echo "Okay, moving on"
        }
      }
    }
    stage('Deploy P (Master)') {
      when { branch 'master' }
      steps {
        build job: 'Subtask_Openstack_Playbook', parameters: [
          [$class: 'StringParameterValue', name: 'INVENTORY', value: 'production'],
          [$class: 'StringParameterValue', name: 'PLAYBOOK', value: 'deploy-embedkaart.yml']
        ]
      }
    }
  }
  post {
    always {
      echo 'Cleaning'
      sh "docker-compose -p ${BUILD_NUMBER} down -v || true"
    }

    success {
      echo 'Pipeline success'
    }

    failure {
      echo 'Something went wrong while running pipeline'
      slackSend(
        channel: 'ci-channel',
        color: 'danger',
        message: "${env.JOB_NAME}: failure ${env.BUILD_URL}"
      )
    }
  }
}
