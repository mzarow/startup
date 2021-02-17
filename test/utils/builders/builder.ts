export abstract class Builder<T> {
  protected entity: T;

  protected constructor(entity: T) {
    this.entity = entity;
  }

  public build(): T {
    return this.entity;
  }
}
