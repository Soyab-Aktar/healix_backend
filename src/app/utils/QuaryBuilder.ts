import { IQuaryConfig, IQuaryParams, PrismaCountArgs, PrismaFindManyArgc, PrismaModelDelegate } from "../interfaces/quary.interface"

export class QuaryBuilder<
  T,
  TWhereInput = Record<string, unknown>,
  TIncludeInput = Record<string, unknown>,
> {
  private quary: PrismaFindManyArgc;
  private countQuary: PrismaCountArgs;
  private page: number = 1;
  private limit: number = 10;
  private sort: string = 'createdAt';
  private sortOrder: 'asc' | 'desc' = 'desc';
  private selectFields: Record<string, boolean | undefined>;

  constructor(
    private model: PrismaModelDelegate,
    private quaryParams: IQuaryParams,
    private config: IQuaryConfig,
  ) {
    this.quary = {
      where: {},
      include: {},
      orderBy: {},
      skip: 0,
      take: 10,
    };
    this.countQuary = {
      where: {},
    }
  }
}