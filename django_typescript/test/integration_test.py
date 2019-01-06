import os
import subprocess
import socket

from django.test import LiveServerTestCase


# =================================
# Docker Image
# ---------------------------------

DOCKER_IMG_NAME = os.environ.get('DJANGO_TS_DOCKER_IMAGE')


# =================================
# Integration Test Case
# ---------------------------------

class IntegrationTestCase(LiveServerTestCase):

    TS_SERVER_SRC_PATH: str

    @property
    def _live_server_url(self):
        return 'http://host.docker.internal' + ':' + self.live_server_url.split(":")[-1]

    def _run_ts_test(self, test_name: str):

        try:
            subprocess.check_call([
                'docker', 'run',
                '-w', '/app/src',
                '--env', 'SERVER_URL=' + self._live_server_url,
                '--net=host',
                '-v', f'{self.TS_SERVER_SRC_PATH}:/app/src',
                DOCKER_IMG_NAME,
                'npm', 'test', '--', "--match=" + test_name
            ])
        except subprocess.CalledProcessError:
            self.fail(msg="Typescript test `{test_name}` failed.".format(test_name=test_name))

