import React from "react";
import { observer } from "mobx-react";
import { Modal, Button } from "semantic-ui-react";
import { useDropzone } from "react-dropzone";
import xml2js from "xml2js";

const FileRenamer = () => {
  const onDrop = (newFiles: File[]) => {
    newFiles.forEach(async (file) => {
      const a = document.createElement("a");
      const parser = new xml2js.Parser();
      a.href = window.URL.createObjectURL(file);
      const trk = await new Promise<any>(async (res, rej) =>
        parser.parseString(await (file as any).text(), (err: any, xml: any) => {
          if (err) {
            rej(err);
          } else {
            res(xml.gpx.trk);
          }
        })
      );
      const name = trk[0]?.name[0];
      const time = trk[0]?.trkseg[0]?.trkpt[0]?.time[0]?.slice(0, 10);

      console.log(name, time);

      a.download = `${name || file.name.split(".")[0]}${
        time ? "-" + time : ""
      }.gpx`;
      a.click();
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    multiple: true,
    onDrop,
  });

  return (
    <Modal trigger={<Button basic content="renamer" />}>
      <Modal.Header>Drop any .gpx files here to rename them.</Modal.Header>
      <Modal.Content>
        <div {...getRootProps()}>
          <div style={{ minHeight: "80vh" }} />
          <input {...getInputProps()} />
        </div>
      </Modal.Content>
    </Modal>
  );
};

export default observer(FileRenamer);
