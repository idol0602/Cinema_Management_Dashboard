import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2Icon } from "lucide-react"

export function AlertDialogDestructive({
    callback,
    payload
}: {
    callback: (payload: any) => void,
    payload: any
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
            variant="ghost"
            size="icon"
            title="Xóa"
            className="text-destructive hover:text-destructive"
          >
            <Trash2Icon className="h-4 w-4" />
                              </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
                <Trash2Icon className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive"/>
          <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa không?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => callback(payload)}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
