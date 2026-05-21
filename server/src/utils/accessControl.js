const getId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return String(value._id || value.id || value);
};

export const isBaseCommander = (req) => req.user?.role === 'Base Commander';

export const getAssignedBaseId = (req) => getId(req.user?.base);

const denyBaseAccess = (res, message) =>
  res.status(403).json({
    success: false,
    message,
  });

export const ensureAssignedBase = (req, res) => {
  if (!isBaseCommander(req)) return true;

  if (!getAssignedBaseId(req)) {
    denyBaseAccess(res, 'Base Commander account is not assigned to a base');
    return false;
  }

  return true;
};

export const ensureBaseAccess = (
  req,
  res,
  base,
  message = 'Base Commanders can only access their assigned base'
) => {
  if (!isBaseCommander(req)) return true;

  const assignedBase = getAssignedBaseId(req);
  if (!assignedBase) {
    denyBaseAccess(res, 'Base Commander account is not assigned to a base');
    return false;
  }

  if (getId(base) !== assignedBase) {
    denyBaseAccess(res, message);
    return false;
  }

  return true;
};

export const ensureTransferAccess = (
  req,
  res,
  transfer,
  message = 'Base Commanders can only access transfers involving their assigned base'
) => {
  if (!isBaseCommander(req)) return true;

  const assignedBase = getAssignedBaseId(req);
  if (!assignedBase) {
    denyBaseAccess(res, 'Base Commander account is not assigned to a base');
    return false;
  }

  if (getId(transfer?.fromBase) !== assignedBase && getId(transfer?.toBase) !== assignedBase) {
    denyBaseAccess(res, message);
    return false;
  }

  return true;
};

export const applyBaseScope = (req, query, field = 'base') => {
  if (isBaseCommander(req)) {
    query[field] = getAssignedBaseId(req) || '000000000000000000000000';
  }

  return query;
};

export const applyTransferScope = (req, query) => {
  if (isBaseCommander(req)) {
    const assignedBase = getAssignedBaseId(req) || '000000000000000000000000';
    query.$or = [{ fromBase: assignedBase }, { toBase: assignedBase }];
  }

  return query;
};
