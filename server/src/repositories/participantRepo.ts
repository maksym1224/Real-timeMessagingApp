import { Participants } from "../models/Participants";
import BaseRepo from "./baseRepo";

export default class ParticipantsRepo extends BaseRepo {
  async newParticipants(ids: Array<number>, roomId: number) {
    await Participants.bulkCreate(
      ids.map((id) => ({
        userId: id,
        roomId,
      }))
    );
  }
}
