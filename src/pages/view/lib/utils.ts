import { imagePlugin } from "@mdxeditor/editor";
import { getAttachment, storeAttachment } from "./services";

export function mdxImagePlugin(id?: string) {
  return imagePlugin({
    async imageUploadHandler(image) {
      const uri = await storeAttachment(id!, image);
      return uri;
    },

    async imagePreviewHandler(src) {
      const attachment = await getAttachment(src);
      if (attachment) {
        return attachment;
      }

      return src;
    },
    disableImageSettingsButton: true,
  });
}
