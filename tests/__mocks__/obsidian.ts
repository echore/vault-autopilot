export class Plugin {
  app: any = {};
  loadData = jest.fn().mockResolvedValue({});
  saveData = jest.fn().mockResolvedValue(undefined);
  addSettingTab = jest.fn();
  registerEvent = jest.fn();
}
export class PluginSettingTab {
  containerEl = { empty: jest.fn(), createEl: jest.fn() };
  constructor(public app: any, public plugin: any) {}
}
export class Setting {
  constructor(_el: any) {}
  setName = jest.fn().mockReturnThis();
  setDesc = jest.fn().mockReturnThis();
  setHeading = jest.fn().mockReturnThis();
  addText = jest.fn((cb: any) => { cb({ setValue: jest.fn().mockReturnThis(), onChange: jest.fn().mockReturnThis() }); return this; });
  addToggle = jest.fn((cb: any) => { cb({ setValue: jest.fn().mockReturnThis(), onChange: jest.fn().mockReturnThis() }); return this; });
  addDropdown = jest.fn((cb: any) => { cb({ addOption: jest.fn().mockReturnThis(), setValue: jest.fn().mockReturnThis(), onChange: jest.fn().mockReturnThis() }); return this; });
  addButton = jest.fn((cb: any) => { cb({ setButtonText: jest.fn().mockReturnThis(), onClick: jest.fn().mockReturnThis() }); return this; });
}
export class Notice { constructor(public message: string, public duration?: number) {} }
export class TFile { path = ''; }
export class TFolder {}
