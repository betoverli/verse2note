#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

/// Native materials for the shell chrome.
/// Liquid Glass (`UIGlassEffect`, prominent glass buttons) is compiled only
/// with the iOS 26 SDK. Older SDKs, and iOS 15–25 at runtime, get classic
/// UIKit blur / filled controls instead.
@interface V2NGlassMaterial : NSObject
+ (BOOL)sdkHasLiquidGlass;
+ (nullable UIVisualEffect *)effectWithInteractive:(BOOL)interactive;
+ (void)applyFabStyleToButton:(UIButton *)button;
@end

NS_ASSUME_NONNULL_END
