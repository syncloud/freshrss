import os
from os.path import join
from subprocess import check_output

import pytest
import requests
from requests.packages.urllib3.exceptions import InsecureRequestWarning
from syncloudlib.http import wait_for_rest
from syncloudlib.integration.hosts import add_host_alias
from syncloudlib.integration.installer import local_install

TMP_DIR = '/tmp/syncloud'

requests.packages.urllib3.disable_warnings(InsecureRequestWarning)


@pytest.fixture(scope="session")
def module_setup(request, device, artifact_dir):
    def module_teardown():
        device.run_ssh('ls -la /var/snap/freshrss/current > {0}/current.ls.log'.format(TMP_DIR), throw=False)
        device.run_ssh('ls -la /var/snap/freshrss/current/config > {0}/config.ls.log'.format(TMP_DIR), throw=False)
        device.run_ssh('ls -la /var/snap/freshrss/common > {0}/common.ls.log'.format(TMP_DIR), throw=False)
        device.run_ssh('ls -la /data/freshrss > {0}/storage.ls.log'.format(TMP_DIR), throw=False)
        device.run_ssh('ls -la /data/freshrss/data > {0}/data.ls.log'.format(TMP_DIR), throw=False)
        device.run_ssh('top -bn 1 -w 500 -c > {0}/top.log'.format(TMP_DIR), throw=False)
        device.run_ssh('ps auxfw > {0}/ps.log'.format(TMP_DIR), throw=False)
        device.run_ssh('netstat -nlp > {0}/netstat.log'.format(TMP_DIR), throw=False)
        device.run_ssh('journalctl | tail -3000 > {0}/journalctl.log'.format(TMP_DIR), throw=False)
        device.run_ssh('cat /etc/hosts > {0}/hosts.log'.format(TMP_DIR), throw=False)

        device.scp_from_device('{0}/*'.format(TMP_DIR), artifact_dir)
        check_output('chmod -R a+r {0}'.format(artifact_dir), shell=True)

    request.addfinalizer(module_teardown)


def test_start(module_setup, device, device_host, app, domain):
    add_host_alias(app, device_host, domain)
    device.run_ssh('date', retries=100)
    device.run_ssh('mkdir {0}'.format(TMP_DIR), throw=False)


@pytest.mark.flaky(retries=50, delay=10)
def test_activate_device(device):
    response = device.activate_custom()
    assert response.status_code == 200, response.text


def test_install(app_archive_path, device_host, device_password, device):
    local_install(device_host, device_password, app_archive_path)


def test_index(app_domain):
    wait_for_rest(requests.session(), "https://{0}".format(app_domain), 200, 20)


def test_login_page(app_domain):
    response = requests.get('https://{0}/'.format(app_domain), verify=False)
    assert response.status_code == 200, response.text
    assert 'FreshRSS' in response.text, response.text


def test_storage_change_event(device):
    device.run_ssh('snap run freshrss.storage-change > {0}/storage-change.log'.format(TMP_DIR))


def test_access_change_event(device):
    device.run_ssh('snap run freshrss.access-change > {0}/access-change.log'.format(TMP_DIR))


def test_remove(device, app):
    response = device.app_remove(app)
    assert response.status_code == 200, response.text


def test_reinstall(app_archive_path, device_host, device_password):
    local_install(device_host, device_password, app_archive_path)
