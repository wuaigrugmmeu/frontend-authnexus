import request from '@/api/core/request'

export function getUserProfile() {
  return request({
    url: '/users/me',
    method: 'get'
  })
}

export function getUserList(params) {
  return request({
    url: '/users',
    method: 'get',
    params
  })
}

export function createUser(data) {
  return request({
    url: '/users',
    method: 'post',
    data
  })
}

export function updateUser(id, data) {
  return request({
    url: `/users/${id}`,
    method: 'put',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: `/users/${id}`,
    method: 'delete'
  })
}

export function getUserRoles(id) {
  return request({
    url: `/users/${id}/roles`,
    method: 'get'
  })
}

export function assignUserRoles(id, roleIds) {
  return request({
    url: `/users/${id}/roles`,
    method: 'post',
    data: { roleIds }
  })
}
