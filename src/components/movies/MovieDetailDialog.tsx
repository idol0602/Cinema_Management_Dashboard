import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Film,
  Calendar,
  Clock,
  Star,
  User,
  MapPin,
  ExternalLink,
  Tag,
  Info,
} from "lucide-react";
import type { MovieType } from "@/types/movie.type";
import type { MovieTypeType } from "@/types/movieType.type";
import { formatDateToVietnamese } from "@/utils/datetime";

interface MovieDetailDialogProps {
  movie: MovieType | null;
  movieTypes: MovieTypeType[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovieDetailDialog({
  movie,
  movieTypes,
  open,
  onOpenChange,
}: MovieDetailDialogProps) {
  if (!movie) return null;

  const getMovieTypeNames = () => {
    const mmTypes = (movie as any).movie_movie_types;
    if (!mmTypes || !Array.isArray(mmTypes) || mmTypes.length === 0) {
      return ["Chưa xác định"];
    }
    return mmTypes.map((mmt: any) => {
      const type = movieTypes.find((t) => t.id === mmt.movie_type_id);
      return type ? type.type : "Chưa xác định";
    });
  };

  const formatDate = formatDateToVietnamese;

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} giờ ${mins} phút`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Film className="h-6 w-6" />
            {movie.title}
          </DialogTitle>
          <DialogDescription>Chi tiết đầy đủ về phim</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Images Section */}
          <div className="grid grid-cols-2 gap-4">
            {movie.image && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Ảnh Bìa
                </h3>
                <img
                  src={movie.image}
                  alt={movie.title}
                  className="w-full h-64 object-cover rounded-lg border"
                />
              </div>
            )}
            {movie.thumbnail && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Thumbnail
                </h3>
                <img
                  src={movie.thumbnail}
                  alt={`${movie.title} thumbnail`}
                  className="w-full h-64 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Đạo Diễn
                  </p>
                  <p className="text-base font-semibold">{movie.director}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Quốc Gia
                  </p>
                  <p className="text-base font-semibold">{movie.country}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Thể Loại
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {getMovieTypeNames().map((name, i) => (
                      <Badge key={i} variant="secondary">
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Ngày Công Chiếu
                  </p>
                  <p className="text-base font-semibold">
                    {formatDate(movie.release_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Thời Lượng
                  </p>
                  <p className="text-base font-semibold">
                    {formatDuration(movie.duration)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Đánh Giá
                  </p>
                  {movie.rating && movie.rating > 0 ? (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-lg font-bold">
                          {movie.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-muted-foreground">/10</span>
                    </div>
                  ) : (
                    <p className="text-base">Chưa có đánh giá</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Mô Tả</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {movie.description}
            </p>
          </div>

          {/* Trailer */}
          {movie.trailer && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Trailer</h3>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(movie.trailer, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Xem Trailer trên YouTube
                </Button>
              </div>
            </>
          )}

          {/* Status */}
          <Separator />
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Trạng Thái Phim</p>
              <p className="text-xs text-muted-foreground">
                Trạng thái hiển thị trong hệ thống
              </p>
            </div>
            {movie.is_active !== false ? (
              <Badge className="bg-green-500">Đang Hoạt Động</Badge>
            ) : (
              <Badge variant="destructive">Ngừng Hoạt Động</Badge>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
