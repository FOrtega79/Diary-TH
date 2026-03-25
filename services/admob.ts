import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const IMAGE_AD_UNIT_ID =
  process.env.EXPO_PUBLIC_ADMOB_REWARDED_IMAGE_ID ?? TestIds.REWARDED;
const AUDIO_AD_UNIT_ID =
  process.env.EXPO_PUBLIC_ADMOB_REWARDED_AUDIO_ID ?? TestIds.REWARDED;

export type AdType = 'image' | 'audio';

export function createRewardedAd(type: AdType): RewardedAd {
  const unitId = type === 'image' ? IMAGE_AD_UNIT_ID : AUDIO_AD_UNIT_ID;
  return RewardedAd.createForAdRequest(unitId, {
    requestNonPersonalizedAdsOnly: false,
  });
}

export function loadAndShowRewardedAd(
  type: AdType,
  onRewarded: () => void,
  onFailed: (error: Error) => void,
): () => void {
  const ad = createRewardedAd(type);

  const unsubscribeLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
    ad.show();
  });

  const unsubscribeEarned = ad.addAdEventListener(
    RewardedAdEventType.EARNED_REWARD,
    () => {
      onRewarded();
    },
  );

  const unsubscribeFailed = ad.addAdEventListener(AdEventType.ERROR, (error) => {
    onFailed(error);
  });

  ad.load();

  return () => {
    unsubscribeLoaded();
    unsubscribeEarned();
    unsubscribeFailed();
  };
}
