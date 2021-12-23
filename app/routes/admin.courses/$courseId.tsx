import {
  ActionFunction,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
} from "remix";
import { ZodError } from "zod";
import { extractValidationErrors, Validator } from "~/util";
import { CourseForm } from "~/features/Admin/components/CourseForm";
import { AdminApi } from "~/features/Admin";
import { Course } from "@prisma/client";

export interface FormFields {
  name: string;
  description: string;
}

export interface ActionData {
  formValues?: FormFields;
  formErrors?: Partial<FormFields>;
}

export interface LoaderData {
  course: Course;
}

export const loader: LoaderFunction = async ({
  params,
}): Promise<LoaderData | Response> => {
  const course = await AdminApi.getCourse(params.courseId!);

  if (!course) {
    return redirect("");
  }

  return {
    course,
  };
};

export const action: ActionFunction = async ({
  request,
  params,
}): Promise<ActionData | Response | void> => {
  const data: Partial<FormFields> = Object.fromEntries(
    await request.formData()
  );

  try {
    await AdminApi.saveCourse(Validator.parse(data), params.courseId);

    return redirect(".");
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        formErrors: extractValidationErrors(error),
        formValues: {
          name: data.name as string,
          description: data.description as string,
        },
      };
    }

    // @ts-ignore
    throw new Error(error.message);
  }
};

export default function () {
  const { course } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  return <CourseForm actionData={actionData} course={course} />;
}
