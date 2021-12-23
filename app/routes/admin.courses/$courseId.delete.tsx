import { ActionFunction, redirect } from "remix";
import { AdminApi } from "~/features/Admin";

export const action: ActionFunction = async ({ params }) => {
  await AdminApi.deleteCourse(params.courseId!);

  return redirect("..");
};
