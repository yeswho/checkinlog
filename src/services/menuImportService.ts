// src/services/menuImportService.ts
import { MenuItem } from '@src/sequelize/models/menuItem';
import { MenuSection } from '@src/sequelize/models/menuSection'
import { MenuSubsection } from '@src/sequelize/models/menuSubsection'
import * as xlsx from 'xlsx';
import { Transaction } from '@sequelize/core';
import { CustomError } from '@src/middleware/errorHandler';

interface ExcelMenuItem {
    section_title: string;
    section_order: number;
    subsection_title: string;
    subsection_description?: string;
    subsection_order: number;
    item_name: string;
    item_price: string;
    item_order: number;
}

export class MenuImportService {
    static async processExcel(fileBuffer: Buffer): Promise<void> {
        const workbook = xlsx.read(fileBuffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data: ExcelMenuItem[] = xlsx.utils.sheet_to_json(worksheet);

        return await MenuSection.sequelize.transaction(async (transaction: Transaction) => {
            try {
                // Clear existing data
                await MenuItem.destroy({ where: {}, transaction });
                await MenuSubsection.destroy({ where: {}, transaction });
                await MenuSection.destroy({ where: {}, transaction });

                // Process sections
                const sections = await this.processSections(data, transaction);
                
                // Process subsections
                const subsections = await this.processSubsections(data, sections, transaction);
                
                // Process items
                await this.processItems(data, subsections, transaction);
            } catch (error) {
                throw new CustomError('Failed to process menu Excel file', 500);
            }
        });
    }

    private static async processSections(data: ExcelMenuItem[], transaction: Transaction) {
        const uniqueSections = [...new Set(data.map(item => ({
            title: item.section_title,
            order: item.section_order
        })))];

        const sections: Record<string, MenuSection> = {};
        
        for (const { title, order } of uniqueSections) {
            const section = await MenuSection.create({
                title,
                display_order: order,
                subsections: []
            }, { transaction });
            
            sections[title] = section;
        }
        
        return sections;
    }

    private static async processSubsections(
        data: ExcelMenuItem[],
        sections: Record<string, MenuSection>,
        transaction: Transaction
    ) {
        const uniqueSubsections = [...new Set(data.map(item => ({
            sectionTitle: item.section_title,
            title: item.subsection_title,
            description: item.subsection_description,
            order: item.subsection_order
        })))];

        const subsections: Record<string, MenuSubsection> = {};
        
        for (const { sectionTitle, title, description, order } of uniqueSubsections) {
            const section = sections[sectionTitle];
            if (!section) continue;

            const subsection = await MenuSubsection.create({
                section_id: section.section_id,
                title,
                description: description || null,
                display_order: order,
                section: new MenuSection,
                items: []
            }, { transaction });
            
            subsections[`${sectionTitle}-${title}`] = subsection;
        }
        
        return subsections;
    }

    private static async processItems(
        data: ExcelMenuItem[],
        subsections: Record<string, MenuSubsection>,
        transaction: Transaction
    ) {
        for (const item of data) {
            const subsection = subsections[`${item.section_title}-${item.subsection_title}`];
            if (!subsection) continue;

            await MenuItem.create({
                subsection_id: subsection.subsection_id,
                name: item.item_name,
                price: item.item_price,
                display_order: item.item_order,
                subsection: new MenuSubsection
            }, { transaction });
        }
    }

    static generateTemplateBuffer(): Buffer {
        const templateData: ExcelMenuItem[] = [
            {
                section_title: 'Beverages and Breakfast',
                section_order: 1,
                subsection_title: 'Beverages',
                subsection_description: 'Various drinks',
                subsection_order: 1,
                item_name: 'Milk Tea',
                item_price: 'Rs.80',
                item_order: 1
            },
            {
                section_title: 'Beverages and Breakfast',
                section_order: 1,
                subsection_title: 'Beverages',
                subsection_description: 'Various drinks',
                subsection_order: 1,
                item_name: 'Hot Chocolate',
                item_price: 'Rs.130',
                item_order: 2
            }
        ];

        const worksheet = xlsx.utils.json_to_sheet(templateData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Menu Template');
        
        return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
}