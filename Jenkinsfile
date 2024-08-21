pipeline {
    agent {
        label 'jenkins-agent'
    }

    environment {
        SONARQUBE_SERVER = 'sonar-scanner-jenkins'
        SONARQUBE_SCANNER = 'sonar-scanner-jenkins'
        SONAR_HOST_URL = 'https://sonar.teamdev.id/'
        SONAR_AUTH_TOKEN = credentials('token-sonarqube')
        DOCKER_HUB_CREDENTIALS = credentials('docker-login-rizqi') 
        DOCKER_IMAGE = 'rnrifai/rnrifai-page:latest' 
        ZAP_DOCKER_IMAGE = 'ghcr.io/zaproxy/zaproxy:stable'
    }

    parameters {
        // Dropdown untuk memilih antara Scan, Release, atau Restart
        choice(name: 'ACTION', choices: ['Scan', 'Release', 'Restart'], description: 'Pilih aksi yang akan dijalankan')

        // Conditional untuk menampilkan branch hanya jika Action adalah Scan
        choice(name: 'BRANCH_NAME', choices: ['main', 'develop', 'feature/new-feature'], description: 'Nama branch (Hanya untuk Scan)', visibleWhen: {
            return params.ACTION == 'Scan'
        })

        // Conditional untuk menampilkan tag hanya jika Action adalah Release
        choice(name: 'TAG_NAME', choices: ['v1.0.0', 'v1.1.0', 'v2.0.0'], description: 'Nama tag (Hanya untuk Release)', visibleWhen: {
            return params.ACTION == 'Release'
        })
    }

    stages {
        stage('Prepare for Scan or Release') {
            when {
                anyOf {
                    expression { return params.ACTION == 'Scan' }
                    expression { return params.ACTION == 'Release' }
                }
            }
            steps {
                script {
                    if (params.ACTION == 'Scan') {
                        echo "Branch yang digunakan: ${params.BRANCH_NAME}"
                    } else if (params.ACTION == 'Release') {
                        echo "Tag yang digunakan: ${params.TAG_NAME}"
                    }
                }
            }
        }

        // Scan stage, hanya muncul jika Action adalah Scan
        stage('[SCA] Trivy Scan') {
            when {
                expression { return params.ACTION == 'Scan' }
            }
            steps {
                script {
                    echo "Melakukan scanning pada branch ${params.BRANCH_NAME} menggunakan Trivy..."
                    sh 'trivy fs --format=json --output=trivy.json .'
                }
                archiveArtifacts artifacts: 'trivy.json'
            }
        }

        // SonarQube SAST scan, hanya muncul jika Action adalah Scan
        stage('[SAST] SonarQube') {
            when {
                expression { return params.ACTION == 'Scan' }
            }
            steps {
                script {
                    def scannerHome = tool name: env.SONARQUBE_SCANNER, type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                    withSonarQubeEnv(env.SONARQUBE_SERVER) {
                        sh "${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=vulnerableApp-Test \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=${SONAR_HOST_URL} \
                            -Dsonar.login=${SONAR_AUTH_TOKEN}"
                    }
                }
            }
        }

        // Release stage, hanya muncul jika Action adalah Release
        stage('Release - Deploy Stagging') {
            when {
                expression { return params.ACTION == 'Release' }
            }
            steps {
                echo "Deploy Stagging menggunakan tag ${params.TAG_NAME}"
                sh 'docker-compose pull'
                sh 'docker-compose up -d' 
            }
        }

        // OWASP ZAP scan, hanya muncul jika Action adalah Release
        stage('[DAST] OWASP ZAP') {
            when {
                expression { return params.ACTION == 'Release' }
            }
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    script {
                        echo 'Running OWASP ZAP scan...'
                        sh 'docker --version'  // Check Docker version to ensure Docker is running
                        sh 'mkdir -p ${WORKSPACE}/zap-reports'  // Ensure the directory exists
                        sh 'docker pull ghcr.io/zaproxy/zaproxy:stable'
                        sh '''
                            docker run --user $(id -u) \
                                -v ${WORKSPACE}/zap-reports:/zap/wrk \
                                ghcr.io/zaproxy/zaproxy:stable \
                                zap-full-scan.py -t http://139.162.18.93:8081 -r /zap/wrk/zap-report.html
                        '''
                        sh 'test -f ${WORKSPACE}/zap-reports/zap-report.html'
                    }
                    sh 'cp ${WORKSPACE}/zap-reports/zap-report.html ./zap-report.html'
                    archiveArtifacts artifacts: 'zap-report.html'
                }
            }
        }

        // Dastardly scan, hanya muncul jika Action adalah Release
        stage('[DAST] Dastardly') {
            when {
                expression { return params.ACTION == 'Release' }
            }
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    script {
                        sh 'docker pull public.ecr.aws/portswigger/dastardly:latest'
                        sh '''
                        docker run --user $(id -u) -v ${WORKSPACE}:${WORKSPACE}:rw \
                        -e BURP_START_URL=http://139.162.18.93:8081 \
                        -e BURP_REPORT_FILE_PATH=${WORKSPACE}/dastardly-report.xml \
                        public.ecr.aws/portswigger/dastardly:latest
                        '''
                    }
                }
                archiveArtifacts artifacts: 'dastardly-report.xml', allowEmptyArchive: true
            }
        }

        // Restart stage, hanya muncul jika Action adalah Restart
        stage('Restart') {
            when {
                expression { return params.ACTION == 'Restart' }
            }
            steps {
                echo 'Me-restart service menggunakan docker-compose...'
                sh 'docker-compose restart'
            }
        }
    }

    post {
        always {
            junit testResults: 'dastardly-report.xml', skipPublishingChecks: true
        }
        success {
            echo "Post Success"
            discordSend description: "Jenkins Pipeline Build", footer: "Pipeline Success", link: env.BUILD_URL, result: currentBuild.currentResult, title: JOB_NAME, webhookURL: "https://discordapp.com/api/webhooks/1245658580485541958/-qTrq_-tzCe6HliVp-U2epamzlh6AN-c2bbzU5FFvJXgNzzz_PxlshYKTtAxI-6gKRVw"
        }
        failure {
            echo "Post Failure"
            discordSend description: "Jenkins Pipeline Build", footer: "Pipeline Failure", link: env.BUILD_URL, result: currentBuild.currentResult, title: JOB_NAME, webhookURL: "https://discordapp.com/api/webhooks/1245658580485541958/-qTrq_-tzCe6HliVp-U2epamzlh6AN-c2bbzU5FFvJXgNzzz_PxlshYKTtAxI-6gKRVw"
        }
    }
}
