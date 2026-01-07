export const orderPaginationConfig = {
  // dùng combobox chọn tiêu chí sort
  sortableColumns : [
  {
    value: "created_at",
    label: "Ngày tạo",
  },
  {
    value: "total_price",
    label: "Tổng giá",
  },
],

searchableColumns : [
  {
    value: "user_id",
    label: "Mã người dùng",
  },
  ],
  // dùng combobox chọn tiêu chí lọc
  filterableColumns: {},

  defaultSortBy: [["created_at", "DESC"]],
  defaultLimit: 10,
  maxLimit: 100,
};
