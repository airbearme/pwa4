// Import the existing storage and extend it
import { MemStorage } from './storage.js';
import { InsertSpot } from '../shared/schema.js';

class FixedStorage extends MemStorage {
  constructor() {
    super();
    
    // Clear existing spots and add all 16 spots
    this.clearSpots();
    
    // Add all 16 Binghamton spots
    const spotsData: InsertSpot[] = [
      { name: 'Court Street Downtown', latitude: '42.099118', longitude: '-75.917538' },
      { name: 'Riverwalk BU Center', latitude: '42.098765', longitude: '-75.916543' },
      { name: 'Confluence Park', latitude: '42.090123', longitude: '-75.912345' },
      { name: 'Southside Walking Bridge', latitude: '42.091409', longitude: '-75.914568' },
      { name: 'General Hospital', latitude: '42.086741', longitude: '-75.915711' },
      { name: 'McArthur Park', latitude: '42.086165', longitude: '-75.926153' },
      { name: 'Greenway Path', latitude: '42.086678', longitude: '-75.932483' },
      { name: 'Vestal Center', latitude: '42.091851', longitude: '-75.951729' },
      { name: 'Innovation Park', latitude: '42.093877', longitude: '-75.958331' },
      { name: 'BU East Gym', latitude: '42.091695', longitude: '-75.963590' },
      { name: 'BU Fine Arts Building', latitude: '42.089282', longitude: '-75.967441' },
      { name: 'Whitney Hall', latitude: '42.088456', longitude: '-75.965432' },
      { name: 'Student Union', latitude: '42.086903', longitude: '-75.966704' },
      { name: 'Appalachian Dining', latitude: '42.084523', longitude: '-75.971264' },
      { name: 'Hinman Dining Hall', latitude: '42.086314', longitude: '-75.973292' },
      { name: 'BU Science Building', latitude: '42.090227', longitude: '-75.972315' },
      { name: 'Downtown Station', latitude: '42.101234', longitude: '-75.915678' },
    ];
    
    spotsData.forEach(spot => this.createSpot(spot));
  }
  
  private clearSpots() {
    // This would need to be implemented in the base class
    // For now, we'll just add the new spots
  }
}

export { FixedStorage };
