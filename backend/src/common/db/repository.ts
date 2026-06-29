import { DatabaseClient } from './database.service';

export type RepositoryContext = {
  db?: DatabaseClient;
};

export abstract class BaseRepository {
  protected resolveClient(context?: RepositoryContext): DatabaseClient | undefined {
    return context?.db;
  }
}
