import { Response } from 'express';
import prisma from '../config/database';
import { PermissionRequest } from '../middleware/permissions';

// Available modules in the system
export const AVAILABLE_MODULES = [
  { id: 'dashboard', name: 'Dashboard', description: 'View dashboard and summaries' },
  { id: 'books', name: 'Book Management', description: 'Manage books and contexts' },
  { id: 'loans', name: 'Loan Management', description: 'Create, view, and manage loans' },
  { id: 'people', name: 'People Management', description: 'Manage people/contacts' },
  { id: 'transactions', name: 'Transactions', description: 'View and manage transactions' },
  { id: 'reports', name: 'Reports', description: 'Access reports and analytics' },
  { id: 'deposits', name: 'Deposits', description: 'Manage deposits' },
  { id: 'calculator', name: 'Interest Calculator', description: 'Use interest calculator' },
  { id: 'staff', name: 'Staff Management', description: 'Manage staff and roles' },
];

export const getAllRoles = async (req: PermissionRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Only owner/admin can view roles
    if (!req.isOwner && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const roles = await prisma.role.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        isSystem: r.isSystem,
        permissions: r.permissions ? JSON.parse(r.permissions) : [],
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getRoleById = async (req: PermissionRequest, res: Response) => {
  try {
    const userId = req.userId;
    const roleId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roleId) {
      return res.status(400).json({ error: 'Role ID is required' });
    }

    // Only owner/admin can view roles
    if (!req.isOwner && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json({
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissions: role.permissions ? JSON.parse(role.permissions) : [],
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Get role by ID error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const createRole = async (req: PermissionRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { name, description, permissions } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Only owner/admin can create roles
    if (!req.isOwner && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Role name is required' });
    }

    // Validate permissions array
    if (permissions && !Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions must be an array' });
    }

    // Check if role name already exists
    const existingRole = await prisma.role.findUnique({
      where: { name: name.trim() },
    });

    if (existingRole) {
      return res.status(400).json({ error: 'Role name already exists' });
    }

    const role = await prisma.role.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        permissions: JSON.stringify(permissions || []),
        isSystem: false,
      },
    });

    res.status(201).json({
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissions: role.permissions ? JSON.parse(role.permissions) : [],
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Create role error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const updateRole = async (req: PermissionRequest, res: Response) => {
  try {
    const userId = req.userId;
    const roleId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, description, permissions } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roleId) {
      return res.status(400).json({ error: 'Role ID is required' });
    }

    // Only owner/admin can update roles
    if (!req.isOwner && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const existingRole = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!existingRole) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Cannot modify system roles
    if (existingRole.isSystem) {
      return res.status(400).json({ error: 'Cannot modify system roles' });
    }

    const updateData: any = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ error: 'Role name cannot be empty' });
      }
      // Check if new name conflicts with existing role
      const nameConflict = await prisma.role.findFirst({
        where: {
          name: name.trim(),
          id: { not: roleId },
        },
      });
      if (nameConflict) {
        return res.status(400).json({ error: 'Role name already exists' });
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (permissions !== undefined) {
      if (!Array.isArray(permissions)) {
        return res.status(400).json({ error: 'Permissions must be an array' });
      }
      updateData.permissions = JSON.stringify(permissions);
    }

    const role = await prisma.role.update({
      where: { id: roleId },
      data: updateData,
    });

    res.json({
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissions: role.permissions ? JSON.parse(role.permissions) : [],
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Update role error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const deleteRole = async (req: PermissionRequest, res: Response) => {
  try {
    const userId = req.userId;
    const roleId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roleId) {
      return res.status(400).json({ error: 'Role ID is required' });
    }

    // Only owner/admin can delete roles
    if (!req.isOwner && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const existingRole = await prisma.role.findUnique({
      where: { id: roleId },
      include: { staff: true },
    });

    if (!existingRole) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Cannot delete system roles
    if (existingRole.isSystem) {
      return res.status(400).json({ error: 'Cannot delete system roles' });
    }

    // Check if role is in use
    if (existingRole.staff.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete role',
        message: `This role is assigned to ${existingRole.staff.length} staff member(s)`,
      });
    }

    await prisma.role.delete({
      where: { id: roleId },
    });

    res.json({ message: 'Role deleted successfully' });
  } catch (error: any) {
    console.error('Delete role error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getAvailableModules = async (req: PermissionRequest, res: Response) => {
  try {
    res.json({ modules: AVAILABLE_MODULES });
  } catch (error: any) {
    console.error('Get modules error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

