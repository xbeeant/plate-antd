/** @jsx jsx */

import { BoldPlugin } from '@udecode/plate-basic-marks';
import { HeadingPlugin } from '@udecode/plate-heading';
import { LinkPlugin } from '@udecode/plate-link';
import { MediaEmbedPlugin } from '@udecode/plate-media';
import { ParagraphPlugin } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';

import type { PlateEditor, PlatePluginList } from '../../types';

import { createPlateEditor } from '../../../client';

jsx;

describe('when inserting html', () => {
  // noinspection CheckTagEmptyBody
  const dataTransfer = {
    constructor: {
      name: 'DataTransfer',
    },
    getData: (format: string) =>
      format === 'text/html' && '<html><body><h1>inserted</h1></body></html>',
  } as any;

  const makeDataTransfer = (value: string): DataTransfer => {
    return {
      constructor: {
        name: 'DataTransfer',
      },
      getData: (format: string) => format === 'text/html' && value,
    } as any;
  };

  describe('when inserting h1 inside p (not empty)', () => {
    it('should just insert h1 text inside p', () => {
      const input = (
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as any as PlateEditor;

      const expected = (
        <editor>
          <hp>
            testinserted
            <cursor />
          </hp>
        </editor>
      ) as any;

      const plugins: PlatePluginList = [HeadingPlugin];

      const editor = createPlateEditor({
        editor: input,
        plugins,
      });

      editor.insertData(dataTransfer);

      expect(editor.children).toEqual(expected.children);
    });
  });

  describe('when inserting h1 inside an empty p', () => {
    it('should set p type to h1 and insert h1 text', () => {
      const input = (
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any as PlateEditor;

      const expected = (
        <editor>
          <hh1>
            inserted
            <cursor />
          </hh1>
        </editor>
      ) as any;

      const plugins: PlatePluginList = [HeadingPlugin];

      const editor = createPlateEditor({
        editor: input,
        plugins,
      });

      editor.insertData(dataTransfer as any);

      expect(editor.children).toEqual(expected.children);
    });
  });

  describe('when inserting a text node surrounded by elements', () => {
    const input = (
      <editor>
        <hp>
          <cursor />
        </hp>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <hp>first element</hp>
        <hp>second element</hp>
        <hp>
          text node in the end
          <cursor />
        </hp>
      </editor>
    ) as any;

    const plugins: PlatePluginList = [ParagraphPlugin];

    const editor = createPlateEditor({
      editor: input,
      plugins,
    });

    editor.insertData(
      makeDataTransfer(
        '<html><body><p>first element</p><p>second element</p>text node in the end</body></html>'
      )
    );

    expect(editor.children).toEqual(expected.children);
  });
});

describe('when inserting empty html', () => {
  const input = (
    <editor>
      <hp>
        test
        <cursor />
      </hp>
    </editor>
  ) as any as PlateEditor;

  // noinspection CheckTagEmptyBody
  const dataTransfer = {
    getData: (format: string) => format === 'text/html' && '<html></html>',
  };

  const output = (
    <editor>
      <hp>
        test
        <cursor />
      </hp>
    </editor>
  ) as any;

  it('should do nothing', () => {
    const plugins: PlatePluginList = [BoldPlugin];

    const editor = createPlateEditor({
      editor: input,
      plugins,
    });

    editor.insertData(dataTransfer as any);

    expect(editor.children).toEqual(output.children);
  });
});

describe('when inserting an iframe without src', () => {
  const input = (
    <editor>
      <hp>
        test
        <cursor />
      </hp>
    </editor>
  ) as any as PlateEditor;

  // noinspection CheckTagEmptyBody
  const data = {
    getData: (format: string) =>
      format === 'text/html' &&
      '<html><body><iframe>inserted</iframe></body></html>',
  };

  const output = (
    <editor>
      <hp>
        testinserted
        <cursor />
      </hp>
    </editor>
  ) as any;

  it('should do nothing', () => {
    const plugins: PlatePluginList = [MediaEmbedPlugin];

    const editor = createPlateEditor({
      editor: input,
      plugins,
    });

    editor.insertData(data as any);

    expect(editor.children).toEqual(output.children);
  });
});

describe('when inserting link with href', () => {
  const input = (
    <editor>
      <hp>
        test
        <cursor />
      </hp>
    </editor>
  ) as any as PlateEditor;

  // noinspection CheckTagEmptyBody
  const data = {
    getData: (format: string) =>
      format === 'text/html' &&
      `<html><body><a href="http://test.com">link</a></body></html>`,
  };

  const output = (
    <editor>
      <hp>
        test
        <ha target="_blank" url="http://test.com">
          link
        </ha>
        <cursor />
      </hp>
    </editor>
  ) as any;

  it('should insert the link with url', () => {
    const plugins: PlatePluginList = [ParagraphPlugin, LinkPlugin];

    const editor = createPlateEditor({
      editor: input,
      plugins,
    });

    editor.insertData(data as any);

    expect(editor.children).toEqual(output.children);
  });
});

describe('when inserting plain text', () => {
  const input = (
    <editor>
      <hp>
        test
        <cursor />
      </hp>
    </editor>
  ) as any as PlateEditor;

  const data = {
    getData: (format: string) => (format === 'text/html' ? '' : 'inserted'),
  };

  const output = (
    <editor>
      <hp>
        testinserted
        <cursor />
      </hp>
    </editor>
  ) as any;

  it('should run default insert', () => {
    jest.spyOn(JSON, 'parse').mockReturnValue(<fragment>inserted</fragment>);

    const editor = createPlateEditor({
      editor: input,
      plugins: [],
    });

    editor.insertData(data as any);

    expect(input.children).toEqual(output.children);
  });
});
