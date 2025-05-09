import request from '@/api/core/request'

export function getRoleList(params) {
  return request({
    url: '/roles',
    method: 'get',
    params
  })
}

export function getRoleDetail(id) {
  return request({
    url: `/roles/${id}`,
    method: 'get'
  })
}

export function createRole(data) {
  return request({
    url: '/roles',
    method: 'post',
    data
  })
}

export function updateRole(id, data) {
  return request({
    url: `/roles/${id}`,
    method: 'put',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: `/roles/${id}`,
    method: 'delete'
  })
}

export function getRolePermissions(id) {
  return request({
    url: `/roles/${id}/permissions`,
    method: 'get'
  })
}

export function assignRolePermissions(id, permissionIds) {
  return request({
    url: `/roles/${id}/permissions`,
    method: 'post',
    data: { permissionIds }
  })
}

export function getRoleUsers(id, params) {
  return request({
    url: `/roles/${id}/users`,
    method: 'get',
    params
  })
}

export function assignRoleUsers(id, userIds) {
  return request({
    url: `/roles/${id}/users`,
    method: 'post',
    data: { userIds }
  })
}

export function removeRoleUser(id, userId) {
  return request({
    url: `/roles/${id}/users/${userId}`,
    method: 'delete'
  })
}
