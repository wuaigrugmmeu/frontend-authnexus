import request from '@/api/core/request'

export function getApplicationList(params) {
  return request({
    url: '/applications',
    method: 'get',
    params
  })
}

export function getApplicationDetail(id) {
  return request({
    url: `/applications/${id}`,
    method: 'get'
  })
}

export function createApplication(data) {
  return request({
    url: '/applications',
    method: 'post',
    data
  })
}

export function updateApplication(id, data) {
  return request({
    url: `/applications/${id}`,
    method: 'put',
    data
  })
}

export function deleteApplication(id) {
  return request({
    url: `/applications/${id}`,
    method: 'delete'
  })
}

export function generateApplicationSecret(id) {
  return request({
    url: `/applications/${id}/secret`,
    method: 'post'
  })
}

export function getApplicationUsers(id, params) {
  return request({
    url: `/applications/${id}/users`,
    method: 'get',
    params
  })
}

export function assignApplicationUsers(id, userIds) {
  return request({
    url: `/applications/${id}/users`,
    method: 'post',
    data: { userIds }
  })
}

export function getApplicationRoles(id, params) {
  return request({
    url: `/applications/${id}/roles`,
    method: 'get',
    params
  })
}

export function assignApplicationRoles(id, roleIds) {
  return request({
    url: `/applications/${id}/roles`,
    method: 'post',
    data: { roleIds }
  })
}

export function getApplicationPermissions(id, params) {
  return request({
    url: `/applications/${id}/permissions`,
    method: 'get',
    params
  })
}

export function assignApplicationPermissions(id, permissionIds) {
  return request({
    url: `/applications/${id}/permissions`,
    method: 'post',
    data: { permissionIds }
  })
}

export function getApplicationLogs(id, params) {
  return request({
    url: `/applications/${id}/logs`,
    method: 'get',
    params
  })
}
