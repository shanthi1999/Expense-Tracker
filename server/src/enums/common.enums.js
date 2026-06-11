const sortOrder = {
    asc: 'ASC',
    desc: 'DESC',
};

const entitySortFields = {
    title: 'title',
    createdAt: 'createdAt',
};

const hexColorPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const getSortDirection = (order) => (order === sortOrder.desc ? -1 : 1);

export default {
    sortOrder,
    entitySortFields,
    hexColorPattern,
    getSortDirection,
};
