import {
  getPlatePluginWithOverrides,
  PlatePlugin,
  SPEditor,
  WithOverride,
} from '@udecode/plate-core';
import { csvDeserializerId } from '@udecode/plate-csv-serializer/src';
import {
  insertDeserializedFragment,
  isDeserializerEnabled,
} from '@udecode/plate-serializer';
import { ReactEditor } from 'slate-react';

export interface WithDeserializeAstOptions<
  T extends SPEditor = SPEditor & ReactEditor
> {
  plugins?: PlatePlugin<T>[];
}

export const astDeserializerId = 'AST Deserializer';

/**
 * Enables support for deserializing inserted content from Slate Ast format to Slate format
 * while apply a small bug fix.
 */
export const withDeserializeAst = <
  T extends ReactEditor & SPEditor = ReactEditor & SPEditor
>({ plugins = [] }: WithDeserializeAstOptions<T> = {}): WithOverride<T> => (
  editor
) => {
  const { insertData } = editor;

  editor.insertData = (data: DataTransfer) => {
    const ast = data.getData('application/x-slate-fragment');

    isDeserializerEnabled(editor, plugins as PlatePlugin[], astDeserializerId);

    const isEnabled = plugins.reduce(
      (all, { deserialize }) =>
        all || (deserialize?.(editor).isDisabled?.(csvDeserializerId) ?? false),
      true
    );

    if (ast && isEnabled) {
      const decoded = decodeURIComponent(window.atob(ast));
      const fragment = JSON.parse(decoded);

      if (fragment.length) {
        return insertDeserializedFragment(editor, { fragment, plugins });
      }
    }

    insertData(data);
  };

  return editor;
};

/**
 * @see {@link withDeserializeAst}
 */
export const createDeserializeAstPlugin = getPlatePluginWithOverrides(
  withDeserializeAst
);
