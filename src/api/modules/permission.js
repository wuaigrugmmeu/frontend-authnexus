import request from '@/api/core/request'

export function getPermissionList() {
  return request({
    url: '/permissions',
    method: 'get'
  })
}

export function getPermissionTree() {
  return request({
    url: '/permissions/tree',
    method: 'get'
  })
}

export function getPermissionDetail(id) {
  return request({
    url: `/permissions/${id}`,
    method: 'get'
  })
}

export function createPermission(data) {
  return request({
    url: '/permissions',
    method: 'post',
    data
  })
}

export function updatePermission(id, data) {
  return request({
    url: `/permissions/${id}`,
    method: 'put',
    data
  })
}

export function deletePermission(id) {
  return request({
    url: `/permissions/${id}`,
    method: 'delete'
  })
}

export function refreshSystemPermissions() {
  return request({
    url: '/permissions/refresh',
    method: 'post'
  })
}

export function getApiPermissions() {
  return request({
    url: '/permissions/api',
    method: 'get'
  })
}

export function getMenuPermissions() {
  return request({
    url: '/permissions/menu',
    method: 'get'
  })
}

export function getButtonPermissions() {
  return request({
    url: '/permissions/button',
    method: 'get'
  })
}
