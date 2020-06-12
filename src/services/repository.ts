import { DynamoDB } from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { State } from "src/types";

const TableName = process.env.TMAGOTCHI_TABLE_NAME;

class Repository {
  db: DynamoDB.DocumentClient = new DynamoDB.DocumentClient({
    region: "eu-west-1",
    apiVersion: "2012-08-10"
  });

  async put(state: State) {
    await this.db
      .put({
        TableName: TableName,
        Item: state
      })
      .promise();
  }

  async get(id: string) {
    try {
      const result = await this.db
        .get({
          TableName: TableName,
          Key: {
            id: id
          }
        } as DocumentClient.GetItemInput)
        .promise();
      return result.Item as State;
    } catch (err) {
      return;
    }
  }
}

export default Repository;
