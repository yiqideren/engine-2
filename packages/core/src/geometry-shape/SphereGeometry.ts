import { Engine } from "../Engine";
import { ShapeGeometry } from "./ShapeGeometry";

/**
 * SphereGeometry.
 */
export class SphereGeometry extends ShapeGeometry {
  private _parameters;
  private _thetaEnd;

  /**
   * @param  radius - Sphere radius.
   * @param  horizontalSegments - Number of horizontal segments
   * @param  verticalSegments - Number of vertical segments
   * @param  alphaStart - Specify horizontal starting angle
   * @param  alphaRange - Specify horizontal sweep angle size
   * @param  thetaStart - Specify vertical starting angle
   * @param  thetaRange - Specify vertical sweep angle size
   */
  constructor(
    engine: Engine,
    radius: number = 1,
    horizontalSegments: number = 8,
    verticalSegments: number = 6,
    alphaStart: number = 0,
    alphaRange: number = Math.PI * 2,
    thetaStart: number = 0,
    thetaRange: number = Math.PI
  ) {
    super(engine);
    this._parameters = {
      radius: radius || 1,
      horizontalSegments: Math.max(3, Math.floor(horizontalSegments)),
      verticalSegments: Math.max(2, Math.floor(verticalSegments)),
      alphaStart: alphaStart,
      alphaRange: alphaRange,
      thetaStart: thetaStart,
      thetaRange: thetaRange
    };
    this._thetaEnd = this._parameters.thetaStart + this._parameters.thetaRange;
    this.initialize(engine);
  }

  /**
   * Generate sphere vertices data.
   * @private
   */
  initialize(engine: Engine) {
    const { verticalSegments, horizontalSegments } = this._parameters;
    // Generate data of geometric vertices on the latitude and longitude lines
    let index = 0;
    const grid = [];
    const vertices: Float32Array = new Float32Array((verticalSegments + 1) * (horizontalSegments + 1) * 8);
    const indices = [];
    // const positions = [];
    for (let iy = 0; iy <= verticalSegments; iy++) {
      const verticesRow = [];
      const v = iy / verticalSegments;
      for (let ix = 0; ix <= horizontalSegments; ix++) {
        const u = ix / horizontalSegments;
        let posX =
          -this._parameters.radius *
          Math.cos(this._parameters.alphaStart + u * this._parameters.alphaRange) *
          Math.sin(this._parameters.thetaStart + v * this._parameters.thetaRange);
        let posY = this._parameters.radius * Math.cos(this._parameters.thetaStart + v * this._parameters.thetaRange);
        let posZ =
          this._parameters.radius *
          Math.sin(this._parameters.alphaStart + u * this._parameters.alphaRange) *
          Math.sin(this._parameters.thetaStart + v * this._parameters.thetaRange);
        posX = Math.abs(posX) < 1e-6 ? 0 : posX;
        posY = Math.abs(posY) < 1e-6 ? 0 : posY;
        posZ = Math.abs(posZ) < 1e-6 ? 0 : posZ;

        const offset = index * 8;
        // POSITION
        vertices[offset] = posX;
        vertices[offset + 1] = posY;
        vertices[offset + 2] = posZ;
        // NORMAL
        vertices[offset + 3] = posX;
        vertices[offset + 4] = posY;
        vertices[offset + 5] = posZ;
        // TEXCOORD_0
        vertices[offset + 6] = u;
        vertices[offset + 7] = 1 - v;

        verticesRow.push(index++);
      }
      grid.push(verticesRow);
    }

    // Generate indices
    for (let iy = 0; iy < verticalSegments; iy++) {
      for (let ix = 0; ix < horizontalSegments; ix++) {
        const a = grid[iy][ix + 1];
        const b = grid[iy][ix];
        const c = grid[iy + 1][ix];
        const d = grid[iy + 1][ix + 1];

        if (iy !== 0 || this._parameters.thetaStart > 0) indices.push(a, b, d);
        if (iy !== verticalSegments - 1 || this._thetaEnd < Math.PI) indices.push(b, c, d);
      }
    }

    this._initialize(engine, vertices, Uint16Array.from(indices));
  }
}
