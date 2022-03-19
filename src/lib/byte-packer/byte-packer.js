// TODO: Port to Typescript?

const BytePacker = class {
  
    constructor(buffer, position = 0) {
      if (buffer == null) {
        throw new Error('The buffer cannot be null.');
      }
  
      if (buffer.length > Number.MAX_VALUE) {
        throw new Error(`The stream is larger than its max capacity: ${Number.MAX_VALUE}`);
      }
  
      this.Position = position;
      this.Buffer = buffer;
    }
  
    readByte() {
      if (this.Position === this.Buffer.length) {
        throw new Error('The end of the stream is reached.');
      }
  
      return this.Buffer[this.Position++];
    }
  
    readBytes(count) {
      if (this.Position + count > this.Buffer.length) {
        throw new Error("The number of bytes to read exceeds the stream's length.");
      }
  
      const array = [];
      for (let i = 0; i < count; i++) {
        array[i] = this.Buffer[this.Position++];
      }
  
      return new Uint8Array(array);
    }
  
    readShort() {
      if (this.Position + 2 > this.Buffer.length) {
        throw new Error('The number of the stream is reached.');
      }
      return new Int16Array(new Uint8Array([this.Buffer[this.Position++], this.Buffer[this.Position++]]).reverse().buffer)[0];
    }
  
    readInt() {
      if (this.Position + 4 > this.Buffer.length) {
        throw new Error('The number of the stream is reached.');
      }
  
      let num = this.Buffer[this.Position++] << 24;
      num |= this.Buffer[this.Position++] << 16;
      num |= this.Buffer[this.Position++] << 8;
      return num | this.Buffer[this.Position++];
    }

  };
  
  export default BytePacker;