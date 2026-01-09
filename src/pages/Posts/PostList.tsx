import { useState, useEffect } from "react";
import { postService } from "@/services/post.service";
import type { PostType } from "@/types/post.type";
import type { PaginationMeta } from "@/types/pagination.type";
import { postPaginateConfig } from "@/config/paginate/post.config";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Eye,
  FileText,
} from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { PostCreateDialog } from "@/components/posts/PostCreateDialog";
import { PostEditDialog } from "@/components/posts/PostEditDialog";
import { PostDetailDialog } from "@/components/posts/PostDetailDialog";
import { useAuth } from "@/hooks/useAuth";

const PostList = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusColumn, setStatusColumn] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [orderColumn, setOrderColumn] = useState("");
  const [meta, setMeta] = useState<PaginationMeta>({
    itemsPerPage: postPaginateConfig.defaultLimit,
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
  });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);

  const findAndPaginate = async (
    page = 1,
    limit = postPaginateConfig.defaultLimit,
    sortBy = postPaginateConfig.defaultSortBy[0][0] +
      ":" +
      postPaginateConfig.defaultSortBy[0][1],
    search = undefined,
    searchBy = undefined,
    filter: Record<string, any> | undefined = undefined
  ) => {
    setLoading(true);
    try {
      const response = await postService.findAndPaginate({
        page,
        limit,
        sortBy,
        search,
        searchBy,
        filter,
      });

      if (response.success && response.data) {
        setPosts(response.data as PostType[]);
        if (response.meta) {
          setMeta(response.meta);
        }
      } else {
        toast.error("Không thể tải danh sách bài viết");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [currentPage]);

  const handleSearch = () => {
    let sortBy =
      postPaginateConfig.defaultSortBy[0][0] +
      ":" +
      postPaginateConfig.defaultSortBy[0][1];
    if (sortColumn && orderColumn) {
      sortBy = `${sortColumn}:${orderColumn}`;
    } else if (sortColumn) {
      sortBy = `${sortColumn}:DESC`;
    }

    const filter: Record<string, any> = {};
    if (statusColumn) {
      filter.is_active = statusColumn === "true";
    }

    findAndPaginate(
      currentPage,
      postPaginateConfig.defaultLimit,
      sortBy,
      searchQuery || undefined,
      searchColumn || undefined,
      Object.keys(filter).length > 0 ? filter : undefined
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setCurrentPage(1);
      handleSearch();
    }
  };

  const handleCreate = async (data: any) => {
    try {
      data.user_id = user?.id;
      const response = await postService.create(data);
      if (response.success) {
        toast.success("Thêm bài viết mới thành công!");
        handleSearch();
      } else {
        toast.error("Không thể thêm bài viết");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm bài viết");
      console.error(error);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!selectedPost) return;
    try {
      const response = await postService.update(
        selectedPost.id as string,
        data
      );
      if (response.success) {
        toast.success("Cập nhật bài viết thành công!");
        handleSearch();
      } else {
        toast.error("Không thể cập nhật bài viết");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật bài viết");
      console.error(error);
    }
  };

  const handleDelete = async (post: PostType) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết "${post.title}" không?`)) {
      return;
    }

    try {
      const response = await postService.delete(post.id as string);
      if (response.success) {
        toast.success("Xóa bài viết thành công!");
        handleSearch();
      } else {
        toast.error("Không thể xóa bài viết");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa bài viết");
      console.error(error);
    }
  };

  const handleViewDetail = (post: PostType) => {
    setSelectedPost(post);
    setDetailDialogOpen(true);
  };

  const handleEdit = (post: PostType) => {
    setSelectedPost(post);
    setEditDialogOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return "N/A";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Quản Lý Bài Viết
              </CardTitle>
              <CardDescription>
                Quản lý danh sách bài viết và thông tin chi tiết
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm Bài Viết Mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm bài viết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Combobox
              datas={postPaginateConfig.filterableColumns.is_active}
              placeholder="Trạng thái"
              onChange={setStatusColumn}
              value={statusColumn}
            />
            <Combobox
              datas={postPaginateConfig.searchableColumns}
              placeholder="Tìm theo"
              onChange={setSearchColumn}
              value={searchColumn}
            />
            <Combobox
              datas={postPaginateConfig.sortableColumns}
              placeholder="Sắp xếp theo"
              onChange={setSortColumn}
              value={sortColumn}
            />
            <Combobox
              datas={[
                { value: "ASC", label: "tăng dần" },
                { value: "DESC", label: "giảm dần" },
              ]}
              placeholder="Thứ tự"
              onChange={setOrderColumn}
              value={orderColumn}
            />
            <Button onClick={handleSearch}>Tìm kiếm</Button>
          </div>

          {/* Table */}
          {loading ? (
            <TableSkeleton />
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Không tìm thấy bài viết nào
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Tiêu Đề</TableHead>
                      <TableHead>Nội Dung</TableHead>
                      <TableHead>Hình Ảnh</TableHead>
                      <TableHead>Người Tạo</TableHead>
                      <TableHead>Ngày Tạo</TableHead>
                      <TableHead className="text-center">Trạng Thái</TableHead>
                      <TableHead className="text-center">Thao Tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post, index) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">
                          {(meta.currentPage - 1) * meta.itemsPerPage +
                            index +
                            1}
                        </TableCell>
                        <TableCell className="font-semibold max-w-xs">
                          {truncateText(post.title, 40)}
                        </TableCell>
                        <TableCell className="max-w-md text-muted-foreground">
                          {truncateText(post.content, 60)}
                        </TableCell>
                        <TableCell>
                          {post.image ? (
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                              <FileText className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">User #{post.user_id}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(post.created_at)}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={post.is_active ? "default" : "secondary"}
                          >
                            {post.is_active ? "Hiển thị" : "Ẩn"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetail(post)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(post)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(post)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Hiển thị {(meta.currentPage - 1) * meta.itemsPerPage + 1} -{" "}
                  {Math.min(
                    meta.currentPage * meta.itemsPerPage,
                    meta.totalItems
                  )}{" "}
                  của {meta.totalItems} bài viết
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === meta.totalPages ||
                          Math.abs(page - currentPage) <= 1
                      )
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2">...</span>
                          )}
                          <Button
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-10"
                          >
                            {page}
                          </Button>
                        </div>
                      ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(meta.totalPages, prev + 1)
                      )
                    }
                    disabled={currentPage === meta.totalPages}
                  >
                    Sau
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <PostCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
      />
      <PostEditDialog
        post={selectedPost}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleUpdate}
      />
      <PostDetailDialog
        post={selectedPost}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
};

const TableSkeleton = () => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Tiêu Đề</TableHead>
            <TableHead>Nội Dung</TableHead>
            <TableHead>Hình Ảnh</TableHead>
            <TableHead>Người Tạo</TableHead>
            <TableHead>Ngày Tạo</TableHead>
            <TableHead className="text-center">Trạng Thái</TableHead>
            <TableHead className="text-center">Thao Tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-8" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-48" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-16 w-16 rounded" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20 mx-auto rounded-full" />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PostList;
