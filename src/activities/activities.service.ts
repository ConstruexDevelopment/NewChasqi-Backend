import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Model, Connection, Schema } from 'mongoose';
import { Activity } from './activity.schema';
import { isValidObjectId } from 'mongoose';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { AddFielDto } from './dto/add-field-activity.dto';

@Injectable()
export class ActivitiesService {
    constructor(
        @Inject('ACTIVITY_MODEL') private ActivityModel: Model<Activity>,
        @Inject('TENANT_CONNECTION') private connection: Connection) { }

    private async getModelForTenant(tenantId: string): Promise<Model<Activity & Document>> {
        const modelName = `Activity_${tenantId}`;
        if (this.connection.models[modelName]) {
            return this.connection.models[modelName] as Model<Activity & Document>;
        }

        // Create a new schema based on the existing schema and add any additional properties
        const schema = new Schema(this.ActivityModel.schema.obj as any, { strict: false });

        // Register and return the new model
        return this.connection.model<Activity & Document>(modelName, schema);
    }

    async getActivities(tenantId: string, employeeId: string) {
        const ActivityModel = await this.getModelForTenant(tenantId);
        return ActivityModel.find();
    }

    async createActivity(createActivityDto: CreateActivityDto, tenantId: string): Promise<Activity> {
        const ActivityModel = await this.getModelForTenant(tenantId);
        const createdActivity = new ActivityModel({
            ...createActivityDto,
            tenantId,
        });
        return createdActivity.save();
    }


    async addField(addFieldDto: AddFielDto, tenantId: string): Promise<{ message: string }> {
        const { fieldName, fieldType } = addFieldDto;

        const validTypes = ['string', 'number', 'boolean', 'date'];
        if (!validTypes.includes(fieldType)) {
            throw new BadRequestException('Invalid field type');
        }

        let defaultValue: any;
        switch (fieldType) {
            case 'string':
                defaultValue = '';
                break;
            case 'number':
                defaultValue = 0;
                break;
            case 'boolean':
                defaultValue = false;
                break;
            case 'date':
                defaultValue = new Date();
                break;
            default:
                throw new BadRequestException('Invalid field type');
        }

        const ActivityModel = await this.getModelForTenant(tenantId);
        const schema = ActivityModel.schema;
        schema.add({ [fieldName]: { type: fieldType, default: defaultValue } });

        await ActivityModel.updateMany({ tenantId }, { $set: { [fieldName]: defaultValue } });

        return { message: `Field '${fieldName}' of type '${fieldType}' added successfully` };
    }

    async updateActivity(id: string, updateActivityDto: UpdateActivityDto, tenantId: string): Promise<Activity> {
        if (!isValidObjectId(id)) {
            throw new BadRequestException('Invalid activity ID');
        }
        const ActivityModel = await this.getModelForTenant(tenantId);
        const updatedActivity = await ActivityModel.findByIdAndUpdate(
            { _id: id, tenantId },
            { $set: updateActivityDto },
            { new: true }
        );
        if (!updatedActivity) {
            throw new NotFoundException('Activity not found');
        }
        return updatedActivity;
    }

    async deleteActivity(id: string, tenantId: string): Promise<{ message: string }> {
        if (!isValidObjectId(id)) {
            throw new BadRequestException('Invalid activity ID');
        }
        const ActivityModel = await this.getModelForTenant(tenantId);
        const deletedActivity = await ActivityModel.findByIdAndDelete({ _id: id, tenantId }).exec();

        if (!deletedActivity) {
            throw new NotFoundException('Activity not found');
        }

        return { message: 'Activity successfully deleted' };
    }
}