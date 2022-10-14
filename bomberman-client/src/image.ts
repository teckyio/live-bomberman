export class AssetImage extends Image {
  constructor(name: string) {
    super()
    this.src = '/assets/' + name
  }
}
