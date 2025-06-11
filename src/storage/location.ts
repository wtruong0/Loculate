const HOME_LOCATION_KEY = 'loculate_home_location';

export const saveOrigin = async (origin: string): Promise<void> => {
  await chrome.storage.local.set({ [HOME_LOCATION_KEY]: origin });
};

export const getOrigin = async (): Promise<string | null> => {
  const result = await chrome.storage.local.get(HOME_LOCATION_KEY);
  return result[HOME_LOCATION_KEY] || null;
}; 