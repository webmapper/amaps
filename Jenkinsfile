pipeline {
  agent any
  options {
    timeout(time: 1, unit: 'HOURS')
  }
  environment {
    COMMIT_HASH = GIT_COMMIT.substring(0, 8)
    PROJECT_PREFIX = "${BRANCH_NAME}_${COMMIT_HASH}_${BUILD_NUMBER}_"
    IMAGE_BASE = "${DOCKER_REGISTRY_HOST}/amaps/embedkaart"
    IMAGE_BUILD = "${IMAGE_BASE}:${BUILD_NUMBER}"
    IMAGE_ACCEPTANCE = "${IMAGE_BASE}:acceptance"
    IMAGE_PRODUCTION = "${IMAGE_BASE}:production"
    IMAGE_LATEST = "${IMAGE_BASE}:latest"
  }
  stages {
//    stage('Test') {
//      parallel {
//        stage('Linting') {
//          environment {
//            PROJECT = "${PROJECT_PREFIX}lint"
//          }
//          steps {
//            sh "docker-compose -p ${PROJECT} up --build --exit-code-from lint lint"
//          }
//          post {
//            always {
//              sh "docker-compose -p ${PROJECT} down -v || true"
//            }
//          }
//        }
//        stage('Unit') {
//          environment {
//            PROJECT = "${PROJECT_PREFIX}unit"
//          }
//          steps {
//            sh "docker-compose -p ${PROJECT} up --build --exit-code-from test test"
//          }
//          post {
//            always {
//              sh "docker-compose -p ${PROJECT} down -v || true"
//            }
//          }
//        }
//      }
    stage('Build A (Master)') {
        tryStep "build", {
                def image_name = "amaps/embedkaart"
                docker.withRegistry("${DOCKER_REGISTRY_HOST}",'docker_registry_auth') {
                def image = docker.build("amaps/embedkaart:${env.BUILD_NUMBER}",
                    "--shm-size 1G " +
                    "--target base " +
                    ".")
                    image.push()
                    image.push("acceptance")
                }
            }
        }


        stage("Deploy to ACC") {
            tryStep "deployment", {
                build job: 'Subtask_Openstack_Playbook',
                parameters: [
                    [$class: 'StringParameterValue', name: 'INVENTORY', value: 'acceptance'],
                    [$class: 'StringParameterValue', name: 'PLAYBOOK', value: 'deploy-embedkaart.yml'],
                ]
            }
        }
    }

    if (BRANCH == "master") {
        stage("Build and Push Production image") {
            tryStep "build", {
                docker.withRegistry("${DOCKER_REGISTRY_HOST}",'docker_registry_auth') {
                    def cachedImage = docker.image("amaps/embedkaart:production")
                    cachedImage.pull()
                    def image = docker.build("amaps/embedkaart:${env.BUILD_NUMBER}",
                        "--shm-size 1G " +
                        "--build-arg BUILD_ENV=prod " +
                        "--build-arg BUILD_NUMBER=${env.BUILD_NUMBER} " +
                        "--build-arg GIT_COMMIT=${env.GIT_COMMIT} " +
                        ".")
                    image.push("production")
                    image.push("latest")
                }
            }
        }
    stage('Waiting for approval (Master)') {
      when {
        branch 'master'
      }
      options {
        timeout(time: 5, unit: 'DAYS')
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
    success {
      echo 'Pipeline success'
    }

    failure {
      echo 'Something went wrong while running pipeline'
      slackSend(
        channel: 'ci-channel',
        color: 'danger',
        message: "${JOB_NAME}: failure ${BUILD_URL}"
      )
    }
  }
}
